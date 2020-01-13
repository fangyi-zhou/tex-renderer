const express = require('express')
const path = require('path')
const app = express()
const tmp = require('tmp-promise')
const child_process = require('child-process-promise')
const fs = require('fs');
const process = require('process');
const git = require('nodegit');

function is_valid({ github_name, github_repo, root }) {
    const safe_chars = /^[A-Za-z-_0-9.]+$/;
    return safe_chars.test(github_name) && safe_chars.test(github_repo) && safe_chars.test(root) && path.extname(root) == ".tex";
}

async function render(github_name, github_repo, root) {
    const tmpdir = await tmp.dir({unsafeCleanup: true});
    const repo = `https://github.com/${github_name}/${github_repo}`;
    await git.Clone(repo, tmpdir.path);
    const latexmk = `latexmk -pdf ${root}`;
    const output_file = path.join(tmpdir.path, path.basename(root, ".tex") + ".pdf");
    const cmd = `cd ${tmpdir.path} && ${latexmk}`;
    console.log(cmd);
    await child_process.exec(cmd, { timeout: 60000 });
    const output = await fs.promises.readFile(output_file);
    tmpdir.cleanup();
    return output;
}

app.use(express.static(path.join(__dirname, 'build')))

app.get('/render/:github_name/:github_repo/:root', async (req, res) => {
    if (!is_valid(req.params)) {
        return res.status(500).send("Invalid params");
    }
    const { github_name, github_repo, root } = req.params;
    const outcome = await render(github_name, github_repo, root);
    res.contentType("application/pdf");
    return res.send(outcome);
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(process.env.PORT || 8080, "0.0.0.0", () => console.log("Listening"))
