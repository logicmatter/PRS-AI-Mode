----
# Node Setup
- Rename Old Version of Node to node-old
```
move c:\pmtools\node c:\pmtools\node-old
```
- Download v20 version portable zip

```
curl -L https://nodejs.org/dist/v20.18.1/node-v20.18.1-win-x64.zip -o c:\pmtools\node-v20.zip
```

- Unzip new Node Version Zip File
```
powershell -Command "Expand-Archive -Path c:\pmtools\node-v20.zip -DestinationPath c:\pmtools -Force"
```
- Rename Folder to node
``
move c:\pmtools\node-v20.18.1-win-x64 c:\pmtools\node
``

----
# BMAD Project Setup
- If not run before then run the `bmad-init.py` file

if you have aldready copied files to folder note it will all be deleted

```
python bmad-init.py
```


----
# Claude CLI Setup

## Step 1: Clear the problematic environment variable
```
set NODE_OPTIONS=
```

## Step 2: Uninstall the old Claude Code
```
npm uninstall -g @anthropic-ai/claude-code
```
## Step 3: Install Claude Code fresh
```
npm install -g @anthropic-ai/claude-code
```

## Step 4: Verify installation
```
claude --version
```

# Step 5: Run Claude Code
claude

- Setup the mode for color
- Authenticate and Authorize CLI
- Use it using claude repl
- 'quit' to return to command line



