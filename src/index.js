const { Command, flags } = require('@oclif/command')
const { Run } = require('./lib')

class Md2AnkiCommand extends Command {
  async run() {
    const { flags } = this.parse(Md2AnkiCommand)
    Run(flags.name, flags.from, flags.out, flags.tag, this.log).catch(this.log)
  }
}

Md2AnkiCommand.description = `Convert markdown files into a single anki package file`

Md2AnkiCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: 'v' }),
  // add --help flag to show CLI version
  help: flags.help({ char: 'h' }),

  from: flags.string({ char: "f", description: "directory path", default: "." }),
  name: flags.string({ char: "n", description: "anki deck name", default: "deck name" }),
  out: flags.string({ char: "o", description: "anki package name", default: "output.apkg" }),
  tag: flags.string({char: "t", description: "tag name for filtering md files", default: ""}),
}

module.exports = Md2AnkiCommand
