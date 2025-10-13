"""KPI (Key Performance Indicator) definitions and formulas"""

from typing import Dict, List, Callable, Any
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass

from ..utils.helpers import (
    calculate_flatline_percentage,
    detect_outliers_zscore,
    safe_divide
)


@dataclass
class KPIDefinition:
    """Definition of a KPI metric"""
    name: str
    category: str  # Base, Behavior, Distribution, Trend, ML
    description: str
    unit: str
    compute_func: Callable[[np.ndarray, Dict[str, Any]], float]


class KPIRegistry:
    """
    Registry of all KPI definitions
    """

    def __init__(self):
        self.kpis: Dict[str, KPIDefinition] = {}
        self._register_all_kpis()

    def _register_all_kpis(self):
        """Register all KPI definitions"""
        # Base KPIs
        self.register_kpi(
            "Actual_Count",
            "Base",
            "Actual number of samples in bucket",
            "count",
            self._compute_actual_count
        )

        self.register_kpi(
            "Expected_Config_Count",
            "Base",
            "Expected sample count from configuration",
            "count",
            self._compute_expected_config_count
        )

        self.register_kpi(
            "Coverage_Pct",
            "Base",
            "Percentage of expected samples received",
            "%",
            self._compute_coverage_pct
        )

        self.register_kpi(
            "Missing_Pct",
            "Base",
            "Percentage of missing samples",
            "%",
            self._compute_missing_pct
        )

        self.register_kpi(
            "Actual_Mean",
            "Base",
            "Mean value of samples",
            "value",
            self._compute_mean
        )

        self.register_kpi(
            "Actual_Median",
            "Base",
            "Median value of samples",
            "value",
            self._compute_median
        )

        self.register_kpi(
            "Actual_Min",
            "Base",
            "Minimum value in bucket",
            "value",
            self._compute_min
        )

        self.register_kpi(
            "Actual_Max",
            "Base",
            "Maximum value in bucket",
            "value",
            self._compute_max
        )

        self.register_kpi(
            "Value_Range",
            "Base",
            "Range of values (max - min)",
            "value",
            self._compute_range
        )

        # Behavior KPIs
        self.register_kpi(
            "Flatline_Pct",
            "Behavior",
            "Percentage of consecutive flatline segments",
            "%",
            self._compute_flatline_pct
        )

        self.register_kpi(
            "Outlier_Count",
            "Behavior",
            "Number of outlier samples (Z-score method)",
            "count",
            self._compute_outlier_count
        )

        self.register_kpi(
            "Value_Constant",
            "Behavior",
            "1 if all values are constant, 0 otherwise",
            "binary",
            self._compute_value_constant
        )

        self.register_kpi(
            "Zero_Count",
            "Behavior",
            "Number of zero values",
            "count",
            self._compute_zero_count
        )

        self.register_kpi(
            "Null_Count",
            "Behavior",
            "Number of null/NaN values",
            "count",
            self._compute_null_count
        )

        # Distribution KPIs
        self.register_kpi(
            "Stddev",
            "Distribution",
            "Standard deviation of values",
            "value",
            self._compute_stddev
        )

        self.register_kpi(
            "Variance",
            "Distribution",
            "Variance of values",
            "value",
            self._compute_variance
        )

        self.register_kpi(
            "IQR",
            "Distribution",
            "Interquartile range (Q3 - Q1)",
            "value",
            self._compute_iqr
        )

        self.register_kpi(
            "Skewness",
            "Distribution",
            "Skewness of distribution",
            "value",
            self._compute_skewness
        )

        self.register_kpi(
            "Kurtosis",
            "Distribution",
            "Kurtosis of distribution",
            "value",
            self._compute_kurtosis
        )

        self.register_kpi(
            "Percentile_25",
            "Distribution",
            "25th percentile",
            "value",
            self._compute_percentile_25
        )

        self.register_kpi(
            "Percentile_75",
            "Distribution",
            "75th percentile",
            "value",
            self._compute_percentile_75
        )

        self.register_kpi(
            "Percentile_95",
            "Distribution",
            "95th percentile",
            "value",
            self._compute_percentile_95
        )

        # Trend KPIs
        self.register_kpi(
            "Slope_Trend",
            "Trend",
            "Linear regression slope",
            "value/sample",
            self._compute_slope_trend
        )

        self.register_kpi(
            "Rate_Change",
            "Trend",
            "Rate of change (last - first) / count",
            "value/sample",
            self._compute_rate_change
        )

        self.register_kpi(
            "Momentum_Trend",
            "Trend",
            "Momentum indicator (recent avg - earlier avg)",
            "value",
            self._compute_momentum_trend
        )

        self.register_kpi(
            "Zscore_Max",
            "Trend",
            "Maximum absolute Z-score",
            "zscore",
            self._compute_zscore_max
        )

        self.register_kpi(
            "First_Value",
            "Trend",
            "First value in bucket",
            "value",
            self._compute_first_value
        )

        self.register_kpi(
            "Last_Value",
            "Trend",
            "Last value in bucket",
            "value",
            self._compute_last_value
        )

    def register_kpi(
        self,
        name: str,
        category: str,
        description: str,
        unit: str,
        compute_func: Callable
    ):
        """Register a new KPI"""
        self.kpis[name] = KPIDefinition(
            name=name,
            category=category,
            description=description,
            unit=unit,
            compute_func=compute_func
        )

    def get_kpi(self, name: str) -> KPIDefinition:
        """Get KPI definition by name"""
        return self.kpis.get(name)

    def get_kpis_by_category(self, category: str) -> List[KPIDefinition]:
        """Get all KPIs in a category"""
        return [kpi for kpi in self.kpis.values() if kpi.category == category]

    def get_all_kpi_names(self) -> List[str]:
        """Get list of all KPI names"""
        return list(self.kpis.keys())

    def get_enabled_kpis(self, config) -> List[str]:
        """Get list of enabled KPI names based on configuration"""
        enabled = []

        if config.metrics.enable_base_metrics:
            enabled.extend([kpi.name for kpi in self.get_kpis_by_category("Base")])

        if config.metrics.enable_behavior_metrics:
            enabled.extend([kpi.name for kpi in self.get_kpis_by_category("Behavior")])

        if config.metrics.enable_distribution_metrics:
            enabled.extend([kpi.name for kpi in self.get_kpis_by_category("Distribution")])

        if config.metrics.enable_trend_metrics:
            enabled.extend([kpi.name for kpi in self.get_kpis_by_category("Trend")])

        return enabled

    # === BASE KPI COMPUTATION FUNCTIONS ===

    def _compute_actual_count(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute actual sample count"""
        return float(len(values))

    def _compute_expected_config_count(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Get expected count from context"""
        return float(context.get('expected_count', 0))

    def _compute_coverage_pct(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute coverage percentage"""
        actual = len(values)
        expected = context.get('expected_count', 1)
        return (actual / expected) * 100 if expected > 0 else 0.0

    def _compute_missing_pct(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute missing percentage"""
        return 100.0 - self._compute_coverage_pct(values, context)

    def _compute_mean(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute mean"""
        if len(values) == 0:
            return np.nan
        return float(np.mean(values))

    def _compute_median(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute median"""
        if len(values) == 0:
            return np.nan
        return float(np.median(values))

    def _compute_min(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute minimum"""
        if len(values) == 0:
            return np.nan
        return float(np.min(values))

    def _compute_max(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute maximum"""
        if len(values) == 0:
            return np.nan
        return float(np.max(values))

    def _compute_range(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute range (max - min)"""
        if len(values) == 0:
            return np.nan
        return float(np.max(values) - np.min(values))

    # === BEHAVIOR KPI COMPUTATION FUNCTIONS ===

    def _compute_flatline_pct(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute flatline percentage"""
        if len(values) < 2:
            return 0.0
        threshold = context.get('flatline_threshold', 0.01)
        return calculate_flatline_percentage(values, threshold)

    def _compute_outlier_count(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute outlier count"""
        if len(values) < 3:
            return 0.0
        threshold = context.get('outlier_zscore_threshold', 3.0)
        outliers = detect_outliers_zscore(values, threshold)
        return float(np.sum(outliers))

    def _compute_value_constant(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Check if all values are constant"""
        if len(values) < 2:
            return 0.0
        return 1.0 if np.std(values) == 0 else 0.0

    def _compute_zero_count(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Count zero values"""
        return float(np.sum(values == 0))

    def _compute_null_count(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Count null/NaN values"""
        return float(np.sum(np.isnan(values)))

    # === DISTRIBUTION KPI COMPUTATION FUNCTIONS ===

    def _compute_stddev(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute standard deviation"""
        if len(values) < 2:
            return np.nan
        return float(np.std(values, ddof=1))

    def _compute_variance(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute variance"""
        if len(values) < 2:
            return np.nan
        return float(np.var(values, ddof=1))

    def _compute_iqr(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute interquartile range"""
        if len(values) < 4:
            return np.nan
        q75 = np.percentile(values, 75)
        q25 = np.percentile(values, 25)
        return float(q75 - q25)

    def _compute_skewness(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute skewness"""
        if len(values) < 3:
            return np.nan
        return float(stats.skew(values))

    def _compute_kurtosis(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute kurtosis"""
        if len(values) < 4:
            return np.nan
        return float(stats.kurtosis(values))

    def _compute_percentile_25(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute 25th percentile"""
        if len(values) == 0:
            return np.nan
        return float(np.percentile(values, 25))

    def _compute_percentile_75(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute 75th percentile"""
        if len(values) == 0:
            return np.nan
        return float(np.percentile(values, 75))

    def _compute_percentile_95(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute 95th percentile"""
        if len(values) == 0:
            return np.nan
        return float(np.percentile(values, 95))

    # === TREND KPI COMPUTATION FUNCTIONS ===

    def _compute_slope_trend(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute linear regression slope"""
        if len(values) < 2:
            return np.nan
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)
        return float(slope)

    def _compute_rate_change(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute rate of change"""
        if len(values) < 2:
            return np.nan
        return float((values[-1] - values[0]) / len(values))

    def _compute_momentum_trend(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute momentum (recent half avg - earlier half avg)"""
        if len(values) < 4:
            return np.nan
        mid = len(values) // 2
        recent_avg = np.mean(values[mid:])
        earlier_avg = np.mean(values[:mid])
        return float(recent_avg - earlier_avg)

    def _compute_zscore_max(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Compute maximum absolute Z-score"""
        if len(values) < 3:
            return np.nan
        mean = np.mean(values)
        std = np.std(values)
        if std == 0:
            return 0.0
        z_scores = np.abs((values - mean) / std)
        return float(np.max(z_scores))

    def _compute_first_value(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Get first value"""
        if len(values) == 0:
            return np.nan
        return float(values[0])

    def _compute_last_value(self, values: np.ndarray, context: Dict[str, Any]) -> float:
        """Get last value"""
        if len(values) == 0:
            return np.nan
        return float(values[-1])


# Global registry instance
_registry: KPIRegistry = None


def get_kpi_registry() -> KPIRegistry:
    """Get or create the global KPI registry"""
    global _registry
    if _registry is None:
        _registry = KPIRegistry()
    return _registry
