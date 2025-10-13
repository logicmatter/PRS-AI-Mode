"""K-Means clustering pipeline for sensor metrics"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pickle
import json
from pathlib import Path

from ..config.config import Config
from ..utils.logger import get_context_logger


class ClusteringPipeline:
    """
    K-Means clustering pipeline for grouping sensors by behavior
    """

    def __init__(self, config: Config):
        """
        Initialize clustering pipeline

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('ml.clustering')

        # ML configuration
        self.n_clusters = config.ml.kmeans_n_clusters
        self.max_iter = config.ml.kmeans_max_iter
        self.n_init = config.ml.kmeans_n_init
        self.feature_names = config.ml.clustering_features

        # Models
        self.scaler: Optional[StandardScaler] = None
        self.kmeans: Optional[KMeans] = None
        self.cluster_labels = {
            0: "Normal",
            1: "Degraded",
            2: "Failed"
        }

        # Model metadata
        self.model_metadata: Dict[str, Any] = {}

        self.logger.info(f"ClusteringPipeline initialized with {self.n_clusters} clusters")

    def prepare_features(
        self,
        metrics_df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Prepare feature matrix from metrics DataFrame

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            Tuple of (features_df, feature_matrix)
        """
        # Pivot metrics to wide format (one row per sensor-bucket)
        pivot_df = metrics_df.pivot_table(
            index=['tid', 'sid', 'year', 'day_number', 'time_bucket_no'],
            columns='metric_name',
            values='metric_value',
            aggfunc='first'
        ).reset_index()

        # Filter to only include configured features
        available_features = [f for f in self.feature_names if f in pivot_df.columns]
        if len(available_features) < len(self.feature_names):
            missing = set(self.feature_names) - set(available_features)
            self.logger.warning(f"Missing features: {missing}")

        if not available_features:
            raise ValueError("No clustering features available in metrics")

        # Extract feature matrix
        feature_matrix = pivot_df[available_features].values

        # Handle missing values (impute with column mean)
        for i in range(feature_matrix.shape[1]):
            col = feature_matrix[:, i]
            col_mean = np.nanmean(col)
            col[np.isnan(col)] = col_mean if not np.isnan(col_mean) else 0.0

        self.logger.info(
            f"Prepared feature matrix: {feature_matrix.shape[0]} samples, "
            f"{feature_matrix.shape[1]} features"
        )

        return pivot_df[['tid', 'sid', 'year', 'day_number', 'time_bucket_no']], feature_matrix

    def train(
        self,
        metrics_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Train K-Means clustering model

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            Dictionary with training results
        """
        self.logger.info("Training K-Means clustering model")

        # Prepare features
        meta_df, feature_matrix = self.prepare_features(metrics_df)

        # Scale features
        self.scaler = StandardScaler()
        scaled_features = self.scaler.fit_transform(feature_matrix)

        # Train K-Means
        self.kmeans = KMeans(
            n_clusters=self.n_clusters,
            max_iter=self.max_iter,
            n_init=self.n_init,
            random_state=42
        )
        self.kmeans.fit(scaled_features)

        # Store metadata
        self.model_metadata = {
            'trained_at': datetime.utcnow().isoformat(),
            'n_samples': len(scaled_features),
            'n_features': scaled_features.shape[1],
            'feature_names': self.feature_names,
            'n_clusters': self.n_clusters,
            'inertia': float(self.kmeans.inertia_),
            'n_iter': int(self.kmeans.n_iter_)
        }

        # Calculate cluster statistics
        cluster_labels = self.kmeans.labels_
        cluster_stats = {}
        for cluster_id in range(self.n_clusters):
            cluster_mask = cluster_labels == cluster_id
            cluster_stats[cluster_id] = {
                'count': int(np.sum(cluster_mask)),
                'percentage': float(np.mean(cluster_mask) * 100)
            }

        self.model_metadata['cluster_stats'] = cluster_stats

        self.logger.info(
            f"Model trained successfully. Inertia: {self.model_metadata['inertia']:.2f}, "
            f"Iterations: {self.model_metadata['n_iter']}"
        )

        return self.model_metadata

    def predict(
        self,
        metrics_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Predict cluster assignments for metrics

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            DataFrame with cluster assignments
        """
        if self.kmeans is None or self.scaler is None:
            raise ValueError("Model not trained. Call train() first.")

        # Prepare features
        meta_df, feature_matrix = self.prepare_features(metrics_df)

        # Scale features
        scaled_features = self.scaler.transform(feature_matrix)

        # Predict clusters
        cluster_ids = self.kmeans.predict(scaled_features)
        cluster_labels = [self.cluster_labels.get(cid, f"Cluster_{cid}") for cid in cluster_ids]

        # Create result DataFrame
        result_df = meta_df.copy()
        result_df['KMeans_Cluster_ID'] = cluster_ids
        result_df['Cluster_Label'] = cluster_labels

        self.logger.info(f"Predicted clusters for {len(result_df)} samples")

        return result_df

    def save_model(self, file_path: str):
        """
        Save trained model to disk

        Args:
            file_path: Path to save model
        """
        if self.kmeans is None or self.scaler is None:
            raise ValueError("No model to save. Train the model first.")

        model_data = {
            'kmeans': self.kmeans,
            'scaler': self.scaler,
            'metadata': self.model_metadata,
            'cluster_labels': self.cluster_labels,
            'feature_names': self.feature_names
        }

        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, 'wb') as f:
            pickle.dump(model_data, f)

        self.logger.info(f"Model saved to {file_path}")

    def load_model(self, file_path: str):
        """
        Load trained model from disk

        Args:
            file_path: Path to load model from
        """
        with open(file_path, 'rb') as f:
            model_data = pickle.load(f)

        self.kmeans = model_data['kmeans']
        self.scaler = model_data['scaler']
        self.model_metadata = model_data['metadata']
        self.cluster_labels = model_data.get('cluster_labels', self.cluster_labels)
        self.feature_names = model_data.get('feature_names', self.feature_names)

        self.logger.info(f"Model loaded from {file_path}")

    def get_cluster_centers(self) -> np.ndarray:
        """
        Get cluster centers (scaled)

        Returns:
            Array of cluster centers
        """
        if self.kmeans is None:
            raise ValueError("Model not trained")
        return self.kmeans.cluster_centers_

    def get_cluster_info(self, cluster_id: int) -> Dict[str, Any]:
        """
        Get information about a specific cluster

        Args:
            cluster_id: Cluster ID

        Returns:
            Dictionary with cluster info
        """
        if self.kmeans is None:
            raise ValueError("Model not trained")

        if cluster_id not in range(self.n_clusters):
            raise ValueError(f"Invalid cluster ID: {cluster_id}")

        center = self.kmeans.cluster_centers_[cluster_id]

        return {
            'cluster_id': cluster_id,
            'label': self.cluster_labels.get(cluster_id, f"Cluster_{cluster_id}"),
            'center': center.tolist(),
            'feature_names': self.feature_names
        }

    def needs_retraining(self) -> bool:
        """
        Check if model needs retraining based on age

        Returns:
            True if retraining is needed
        """
        if not self.model_metadata or 'trained_at' not in self.model_metadata:
            return True

        trained_at = datetime.fromisoformat(self.model_metadata['trained_at'])
        age_days = (datetime.utcnow() - trained_at).days

        return age_days >= self.config.ml.kmeans_refit_days
