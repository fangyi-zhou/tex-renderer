import express from "express";
import path from "path";
import tmp from "tmp-promise";
import child_process from "child-process-promise";
import fs from "fs";
import process from "process";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import config from "config";
import http from "http";
import {createClient} from "redis";
import {Strategy as GitHubStrategy} from "passport-github"
import connect_redis from "connect-redis"

const app = express();
const baseUrl : string = config.get("baseUrl");
const RedisStore = connect_redis(session);
const safe_chars = /^[A-Za-z-_0-9.]+$/;
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;


function is_valid({ github_name, github_repo }: {github_name: string, github_repo: string}): boolean {
  return safe_chars.test(github_name) && safe_chars.test(github_repo);
}

class UserError extends Error {}

async function main() {
  let client = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    legacyMode: true,
  });
  await client.connect().catch(console.error);
  client.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
  });

  passport.use(
    new GitHubStrategy({ ...config.get("githubOauthConfig") }, function (
      accessToken,
      refreshToken,
      profile,
      cb
    ) {
      cb(null, accessToken);
    })
  );

  app.use(
    session({
      store: new RedisStore({ client }),
      secret: "tex-renderer",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: Express.User, done) {
    done(null, user);
  });

  async function render(
    github_name: string,
    github_repo: string,
    root: string,
    token?: string
  ) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });
    const auth = token ? token + "@" : "";
    const repo = `https://${auth}github.com/${github_name}/${github_repo}`;
    const clone_cmd = `cd ${tmpdir.path} && git clone ${repo} --depth=1 .`;
    const latexmk = `latexmk -pdf ${root}`;
    const output_file = path.join(
      tmpdir.path,
      path.basename(root, ".tex") + ".pdf"
    );
    const latexmk_cmd = `cd ${tmpdir.path} && ${latexmk}`;
    try {
      await child_process.exec(clone_cmd, { timeout: 20000 });
    } catch (e) {
      tmpdir.cleanup();
      throw new UserError("Error cloning the repository.");
    }
    try {
      await child_process.exec(latexmk_cmd, { timeout: 40000 });
    } catch (e) {
      tmpdir.cleanup();
      throw new UserError("Error running latexmk.");
    }
    const output = await fs.promises.readFile(output_file);
    tmpdir.cleanup();
    return output;
  }

  app.use(express.static(path.join(__dirname, "../build")));
  app.use(morgan("combined"));

  app.get("/render/:github_name/:github_repo/*", async (req, res) => {
    if (!is_valid(req.params)) {
      return res.status(500).send("Invalid params");
    }
    const { github_name, github_repo } = req.params;
    try {
      const tex_paths = req.url.split("/").slice(4);
      if (!tex_paths || tex_paths.length === 0) throw new Error();
      tex_paths.forEach((path) => {
        if (!path || path === ".." || !safe_chars.test(path)) throw new Error();
      });
      const tex_root = tex_paths.join("/");
      const outcome = await render(
        github_name,
        github_repo,
        tex_root,
        req.user 
      );
      res.contentType("application/pdf");
      return res.send(outcome);
    } catch (e) {
      if (e instanceof UserError) {
        res.status(400).send(e.message);
      } else {
        res.sendStatus(500);
      }
    }
  });

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  app.get("/auth/", passport.authenticate("github"));

  app.get(
    "/auth/callback",
    passport.authenticate("github", { failureRedirect: "/auth" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/");
    }
  );

  setInterval(() => {
    // Keep Heroku app alive
    http.get(baseUrl, (_) =>
      console.log(`Keeping app alive ${new Date().toISOString()}`)
    );
  }, 25 * 60 * 1000);

  app.listen(port, "0.0.0.0", () =>
    console.log("Listening")
  );
}

main().then(console.log).catch(console.error);
