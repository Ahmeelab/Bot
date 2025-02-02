const fs = require('fs');
const path = require('path');

// Command folder path (make sure this folder exists)
const commandFolderPath = path.join(__dirname, 'module', 'command');

// Function to add command
module.exports = (event, args) => {
  if (args.length === 0) {
    return event.reply('Please provide a command name and content.');
  }

  const commandName = args[0]; // Command name
  const commandContent = args.slice(1).join(' '); // The content of the command
  
  // Create file path for the new command
  const filePath = path.join(commandFolderPath, `${commandName}.js`);

  // Prepare the content of the new command file
  const commandFileContent = `
module.exports = {
  name: '${commandName}',
  description: '${commandContent}',
  execute: (event) => {
    event.reply('${commandContent}');
  }
};
  `;

  // Write the content to the file
  fs.writeFile(filePath, commandFileContent, (err) => {
    if (err) {
      return event.reply('Error saving command: ' + err.message);
    }
    event.reply(`Command .${commandName} has been added successfully!`);

    // Restart the bot automatically after file creation
    console.log(`Command .${commandName} added. Restarting bot...`);

    // Gracefully exit the process to trigger restart
    process.exit(1);
  });
};
