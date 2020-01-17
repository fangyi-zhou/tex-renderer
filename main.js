const express = require('express')
const path = require('path')
const app = express()
const tmp = require('tmp-promise')
const child_process = require('child-process-promise')
const fs = require('fs');
const process = require('process');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const config = require('config');

passport.use(new GitHubStrategy({... config.get('githubOauthConfig')},
  function(accessToken, refreshToken, profile, cb) {
    cb(null, accessToken);
  }
));

app.use(session({
  secret: 'tex-renderer',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const safe_chars = /^[A-Za-z-_0-9.]+$/;

function is_valid({ github_name, github_repo }) {
    return safe_chars.test(github_name) && safe_chars.test(github_repo);
}

async function render(github_name, github_repo, root, token) {
    const tmpdir = await tmp.dir({ unsafeCleanup: true });
    const auth = token ? token + "@" : "";
    const repo = `https://${auth}github.com/${github_name}/${github_repo}`;
    const clone_cmd = `cd ${tmpdir.path} && git clone ${repo} --depth=1 .`;
    const latexmk = `latexmk -pdf ${root}`;
    const output_file = path.join(tmpdir.path, path.basename(root, ".tex") + ".pdf");
    const latexmk_cmd = `cd ${tmpdir.path} && ${latexmk}`;
    await child_process.exec(clone_cmd, { timeout: 20000 });
    await child_process.exec(latexmk_cmd, { timeout: 40000 });
    const output = await fs.promises.readFile(output_file);
    tmpdir.cleanup();
    return output;
}

app.use(express.static(path.join(__dirname, 'build')))
app.use(morgan('combined'));

app.get('/render/:github_name/:github_repo/*', async (req, res) => {
    if (!is_valid(req.params)) {
        return res.status(500).send("Invalid params");
    }
    const { github_name, github_repo } = req.params;
    try {
        const tex_paths = req.url.split('/').slice(4);
        if (!tex_paths || tex_paths.length == 0) throw new Error();
        tex_paths.forEach(path => {
            if (!path || path == ".." || !safe_chars.test(path)) throw new Error();
        });
        const tex_root = tex_paths.join('/');
        const outcome = await render(github_name, github_repo, tex_root, req.user);
        res.contentType("application/pdf");
        return res.send(outcome);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.get('/auth/',
  passport.authenticate('github'));

app.get('/auth/callback',
  passport.authenticate('github', { failureRedirect: '/auth' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.listen(process.env.PORT || 8080, "0.0.0.0", () => console.log("Listening"))
