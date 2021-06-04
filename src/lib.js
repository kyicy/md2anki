var hljs = require('highlight.js');
const fs = require('fs/promises');
const path = require('path')

var md = require('markdown-it')({
    langPrefix: 'hljs ',
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }

        return '';
    }
});


md.use(require('@traptitech/markdown-it-katex'))
    .use(require('markdown-it-checkbox'))
    .use(require('markdown-it-meta'));



var header = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <div class="anki-container"lang="en" data-color-mode="dark" data-light-theme="light" data-dark-theme="dark">
    <div class="logged-in env-production page-responsive page-blob" style="word-wrap: break-word;">
      <article class="markdown-body entry-content container-lg" itemprop="text">
    
`

var footer = `
    </article>
  </div>
</div>
`


const AnkiExport = require('anki-apkg-export').default;

exports.Run = async function (deckName, from, to, logger) {
    var cssStr = ""
    const cssFiles = ["github-dark.min.css", "primer.min.css", "vs2015.min.css", "katex.min.css"]

    for await (const fileName of cssFiles) {
        const file = path.resolve(__dirname, "asset", fileName)
        const content = await fs.readFile(file)
        cssStr += `\n${content.toString()}\n`
    }


    const apkg = new AnkiExport(deckName, {
        questionFormat: `${header}{{Front}}${footer}`,
        answerFormat: '{{FrontSide}}',
        css: cssStr,
    });


    let count = 0
    const walk = async (fromPath) => {
        const files = await fs.readdir(fromPath)

        for await (const file of files) {
            if (file.startsWith(".")) {
                continue
            }
            actualPath = path.resolve(fromPath, file)
            const stat = await fs.stat(actualPath)
            if (stat && stat.isDirectory()) {
                await walk(actualPath)
                continue
            }
            const extName = path.extname(actualPath)
            if (extName != ".md" && extName != ".markdown") {
                continue
            }
            count++
            const buf = await fs.readFile(actualPath)
            const cardContent = md.render(buf.toString())
            apkg.addCard(header + cardContent + footer, "", { tags: md.meta.tags } || [])
        }
    }


    const fromPath = path.resolve(from)
    await walk(fromPath)

    if (count == 0) {
        logger(`No markdown file found at: ${fromPath}`)
        return
    }

    const outFile = path.resolve(to)
    const zip = await apkg.save()
    await fs.writeFile(outFile, zip, 'binary')
    logger(`Anki Pacakge file has been saved as : ${to}`)
}

