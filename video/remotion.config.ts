import path from "path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// shared/remotion/* (course-wide components such as the lesson cover) live outside this project:
// resolve their imports (react) from this project's node_modules.
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.resolve(process.cwd(), "node_modules"), "node_modules"] },
}));
