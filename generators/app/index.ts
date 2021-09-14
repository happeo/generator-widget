import Generator from 'yeoman-generator';
import yosay from 'yosay';
import * as path from 'path';

enum Option {
  WidgetName = "name",
  WidgetType = "type",
  CreateFolder = "createFolder",
  Subdir = "subdir",
};

enum WidgetType {
  Vanilla = "VanillaJS",
  ReactJs = "React - JS",
  ReactTs = "React - TS",
  LitJs = "Lit - JS",
  LitTs = "Lit - TS"
};

class TemplateGenerator extends Generator {

  constructor(args: any | any[], options: any[]) {
    super(args, options);

    this.option("name", {
      type: String,
      alias: 'n',
      description: "The name of the widget to create."
    });

    this.option("createFolder", {
      type: String,
      alias: 'c',
      description: "Where do you want to place the files?"
    });

    this.option("type", {
      type: String,
      alias: 't',
      description: "Which project type would you like to use?"
    });

    this.option('skip-install', {
      type: Boolean,
      description: 'Do not automatically install dependencies.',
      default: false
    });
  }

  /**
   * Runs on initializing the generator
   */
  public initializing() {
    this.log(yosay('Welcome to the Happeo Widget Generator!'));

    this.config.set(Option.WidgetName, this.options.name || undefined);

    if (this.options.type !== undefined) {
      this.config.set(Option.WidgetType, this.options.type);
    }

    if (this.options.createFolder !== undefined) {
      this.config.set(Option.CreateFolder, this.options.createFolder);
    }
  }

  /**
   * Asking the questions
   */
  public async prompting(): Promise<void> {
    const questions: Generator.Questions = [{
      type: "input",
      default: 'happeo-widget',
      name: Option.WidgetName,
      message: "What is the name of your widget to create? ([a-z0-9_-])",
      validate: (input: string) => {
        const re = /^[a-z\d_-]*$/;
        if (re.test(input)) {
          return true;
        } else {
          return "Your widget name doesn't match the pattern.";
        }
      },
      when: this.options.name === undefined
    },
    {
      type: "list",
      default: "current",
      name: Option.CreateFolder,
      message: 'Where do you want to place the files?',
      choices: [
          {
              name: 'Use the current folder',
              value: 'current'
          },
          {
              name: 'Create a subfolder with solution name',
              value: 'subdir'
          }
      ],
      when: this.options.createFolder === undefined
    },
    {
      type: "list",
      default: null,
      name: Option.WidgetType,
      choices: [...Object.keys(WidgetType).map(key => WidgetType[key])],
      message: "Which project type would you like to use?",
      when: this.options.placeholder === undefined
    }];

    const answers: Generator.Answers = await this.prompt(questions);

    const createFolder = this.options.createFolder === undefined ? answers[Option.CreateFolder] : this.options.createFolder;
    const widgetName = this.options.name || answers[Option.WidgetName];

    if (createFolder === "subdir") {
      const folderPath = createFolder ? widgetName.toLowerCase().replace(/ /g, '-') : "";
      this.destinationRoot(this.destinationPath(folderPath));
      this.config.set(Option.Subdir, folderPath);
    }
    
    this.config.set(Option.WidgetName, widgetName);
    this.config.set(Option.WidgetType, this.options.type === undefined ? answers[Option.WidgetType] : this.options.type);
    this.config.set(Option.CreateFolder, createFolder);

    return;
  }

  /**
   * Configuring the new workspace
   */
  public configuring() {
    const widgetName = this.config.get(Option.WidgetName);
    const widgetType = this.config.get(Option.WidgetType);

    let pkgPath: string | null = null;
    let pkgJson: any = null;

    if (widgetType === WidgetType.LitJs) {
      pkgJson = require('./pkgFiles/lit-js.package.json');
    } else if (widgetType === WidgetType.LitTs) {
      pkgJson = require('./pkgFiles/lit-ts.package.json');
    } else if (widgetType === WidgetType.ReactJs) {
      pkgJson = require('./pkgFiles/react-js.package.json');
    } else if (widgetType === WidgetType.ReactTs) {
      pkgJson = require('./pkgFiles/react-ts.package.json');
    } else if (widgetType === WidgetType.Vanilla) {
      pkgJson = require('./pkgFiles/vanilla.package.json');
    }
    
    pkgPath = path.join(this.destinationPath(), 'package.json');

    if (pkgJson && pkgPath) {
      pkgJson.name = widgetName;

      if (!this.fs.exists(pkgPath)) {
        this.log('Creating a new package.json file for the project.');
        this.fs.writeJSON(pkgPath, pkgJson, null, 2);
      } else {
        this.log('The package.json already existed, skipping the creation of a new one.');
      }
    }
  }

  /**
   * Writing the files
   */
  public async writingTemplateFiles() {
    this.log("Creating files for the Happeo widget.");

    // Retrieve other settings
    const projectType = this.config.get(Option.WidgetType);

    if (projectType === WidgetType.LitJs) {
      this.fs.copyTpl(this.templatePath("lit-js"), this.destinationPath());
    } else if (projectType === WidgetType.LitTs) {
      this.fs.copyTpl(this.templatePath("lit-ts"), this.destinationPath());
    } else if (projectType === WidgetType.ReactJs) {
      this.fs.copyTpl(this.templatePath("react-js"), this.destinationPath());
    } else if (projectType === WidgetType.ReactTs) {
      this.fs.copyTpl(this.templatePath("react-ts"), this.destinationPath());
    } else if (projectType === WidgetType.Vanilla) {
      this.fs.copyTpl(this.templatePath("vanilla"), this.destinationPath());
    }
  }

  public ensureCorrectFolder() {
    if (this.config.get(Option.CreateFolder) === "subdir") {
      this.destinationRoot(this.destinationPath());
    }
  }

  /**
   * Install the required dependencies for the template build engine
   */
  public installCoreDependencies() {
    if (this.options['skip-install']) {
      this.log("Skipping dependency installation");
    } else {
      this.log("Installing dependencies");

      if (this.config.get(Option.CreateFolder) === "subdir") {
        this.spawnCommand("npm", ["install"], { cwd: this.config.get(Option.Subdir)})
      }
    }
  }

  public end() {
    this.log("All done! You can start building your widget!");
  }
}

export = TemplateGenerator;