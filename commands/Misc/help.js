const { SlashCommandBuilder } = require("@discordjs/builders");

function printHelpByCollection(collection, category) {
  const commands = collection
    .filter((item) => item.category === category || category === null)
    .map((command) => {
      return (
        "`" +
        `${command.data.name || command.name} :` +
        "`" +
        " " +
        `${command.data.description || command.description}, `
      );
    });
  return commands || null;
}

module.exports = {
  name: "help",
  category: "Misc",
  aliases: ["h"],
  description: "Return all commands, or one specific command",
  usage: "h <category> <command>, both are optional",
  async run(message, args, client, prefix) {
    const listCategories = (collection) => {
      return collection.map((command) => "`" + command.category + "`");
    };

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    const cmd = args.join(" ");
    const categories = listCategories(client.commands).filter(onlyUnique);

    if (!cmd) {
      const embed = {
        color: "#9dcc37",
        title: `${client.user.username}'s Categories!`,
        description:
          `These are my command categories ${categories.join(
            ", "
          )}. To get more Information about each category, use ` +
          "`" +
          `${prefix}help <category>` +
          "`",
        timestamp: new Date(),
        footer: {
          text: `Requested by ${message.member.user.username}`,
          icon_url: `${message.member.user.avatarURL()}`,
        },
      };
      return await message.channel.send({ embeds: [embed] });
    }

    if (cmd) {
      const command =
        client.commands.get(cmd) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(cmd));

      if (categories.includes("`" + cmd + "`")) {
        const commandsperCategory = printHelpByCollection(client.commands, cmd);
        if (!commandsperCategory)
          return await message.channel.send(
            `Category does not exist. Make sure to write the category name as it is`
          );
        const embed = {
          color: "#9dcc37",
          title: `${client.user.username}'s ${cmd} Commands!`,
          description: `${commandsperCategory.join("\n")}`,
          timestamp: new Date(),
          footer: {
            text: `Requested by ${message.member.user.username}`,
            icon_url: `${message.member.user.avatarURL()}`,
          },
        };
        return await message.channel.send({ embeds: [embed] });
      }

      if (!command && !categories.includes("`" + cmd + "`")) {
        return await message.channel.send(
          "What you provided is neither a command nor a category"
        );
      }

      if (!categories.includes("`" + cmd + "`")) {
        const embed = {
          color: "#9dcc37",
          fields: [
            {
              name: "Aliases",
              value: "`" + `${command?.aliases.join(", ")}` + "`",
            },
            {
              name: "Requires arguments?",
              value: `${command?.args ? "Yes" : "No"}`,
            },
            {
              name: "Category",
              value: `${command.category}`,
            },
            {
              name: "Description",
              value: `${command.description}`,
            },
            {
              name: "Usage",
              value: "`" + `${prefix}${command?.usage}` + "`",
            },
          ],
          timestamp: new Date(),
          footer: {
            text: `Requested by ${message.member.user.username}`,
            icon_url: `${message.member.user.avatarURL()}`,
          },
        };

        return await message.channel.send({ embeds: [embed] });
      }
    }
  },
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands for this bot!")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("show help by category")
        .addChoice("Admin", "admin")
        .addChoice("Anime", "anime")
        .addChoice("Fun", "fun")
        .addChoice("Music", "music")
        .addChoice("Misc", "misc")
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const category = interaction.options.getString("category");

    let help;
    help = printHelpByCollection(client.commands, category);

    const embed = {
      color: "#9dcc37",
      title: `${client.user.username}'s Commands!`,
      description: `${help.join("\n")}`,
      timestamp: new Date(),
      footer: {
        text: `Requested by ${interaction.user.username}`,
        icon_url: `${interaction.user.avatarURL()}`,
      },
    };

    await interaction.followUp({ embeds: [embed] });
  },
};
