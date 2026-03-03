# PNPM, React Native, and the Windows MAX_PATH Limit

## The Problem
When building Expo or React Native applications with native code (specifically C++ modules like `expo-modules-core` or `react-native-screens`) inside a **PNPM Monorepo on Windows**, the build process will often fail with errors such as:

- `The system cannot find the file specified: prefab_command.bat`
- `ninja: error: manifest 'build.ninja' still dirty after 100 tries`

### Why This Happens
This is caused by the intersection of three factors:

1. **Windows MAX_PATH Limit:** Windows has a strict, historical, hardcoded maximum path length of 260 characters (`MAX_PATH`). Without enabling specific registry hacks (which are often ignored by older C++ compilation tools anyway), the Windows API will immediately fail to read or write any file whose absolute path exceeds 260 characters.
2. **PNPM's Symlink Architecture:** Unlike NPM or Yarn which "hoist" overlapping dependencies to a flat `node_modules` at the root, PNPM uses a strict, deeply nested web of symbolic links (e.g., `node_modules/.pnpm/react-native@0.74.0_.../node_modules/react-native/ReactCommon/cxxreact/...`). This architectural decision produces incredibly long string arrays for file paths.
3. **CMake and Ninja Build Systems:** The Native Android compiler uses CMake and Ninja to compile C++ code required by React Native modules. During the build, CMake expands the PNPM symlinks to their absolute paths and concatenates them with its own internal `/android/.cxx/Debug/...` build directories.

**The Collision:** The deeply nested PNPM paths combined with CMake's internal caching paths instantly exceed 260 characters. When Ninja attempts to track file modifications via timestamps to determine if a build is "dirty" or "clean", it fails to read the files because Windows truncates the path. Thus, Ninja constantly thinks the `build.ninja` manifest is changing infinitely, throwing the *"still dirty after 100 tries"* crash.

## The Solution

The most robust and pragmatic solution for developing Expo/React Native Monorepos on Windows is to **abandon PNPM and use NPM Workspaces or Yarn Workspaces.**

### Why NPM Workspaces Work
NPM Workspaces use a "hoisting" resolution strategy. They analyze the entire monorepo dependency tree and pull all possible shared packages up to the root `D:\PROJECTS\assetsally\node_modules` directory in a completely flat structure. 

By flattening the dependencies instead of symlinking them, NPM Workspaces drastically shortens the absolute file paths. When the Android C++ build tools execute, the file paths safely remain well underneath the 260-character Windows `MAX_PATH` limit, allowing CMake and Ninja to read timestamps correctly and successfully compile the app.
