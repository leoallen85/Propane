/*
Add github repo descriptions to your Campfire rooms in Propane (propaneapp.com).
Adapted from protocool's https://gist.github.com/825404
*/

var githubber = true;
if(githubber){
  // github repo info inline
  Campfire.GitHubber = Class.create({
    initialize: function(chat) {
      this.chat = chat;
      var messages = this.chat.transcript.messages;
      for(var i = 0; i < messages.length; i++) {
        this.detectGithubURL(messages[i]);
      }
    },
    detectGithubURL: function(message) {
      if (!message.pending() && message.kind === 'text') {

        var links = message.bodyElement().select('a:not(image)');
        
        if (links.length != 1) return;

        var href = links[0].getAttribute('href'),
            match = href.match(/^https?:\/\/github.com\//),
            api = 'http://github.com/api/v2/json/repos/show/';

        if (!match) return;

        api += href.replace(/^https?:\/\/github.com\//,'');
        window.propane.requestJSON(message.id(), api, 'window.chat.githubber', 'onEmbedDataLoaded', 'onEmbedDataFailed');
      }
    },

    onEmbedDataLoaded: function(messageID, data) {
      var message = window.chat.transcript.getMessageById(messageID);
      if (!message) return;
      message.resize((function() {
        message.bodyCell.insert({bottom: '<div style="color: red; width:100%; margin-top:5px; padding-top: 5px; border-top:1px dotted #ccc;">'+data.repository.description+'</div>'});
      }).bind(this));
    },

    onEmbedDataFailed: function(messageID) {
      /* No cleanup required, we only alter the HTML after we get back a succesful load from the data */
    },

    onMessagesInsertedBeforeDisplay: function(messages) {
      for (var i = 0; i < messages.length; i++) {
        this.detectGithubURL(messages[i]);
      }
    },

    onMessageAccepted: function(message, messageID) {
      this.detectGithubURL(message);
    }
    
  });

  Campfire.Responders.push("GitHubber");
  window.chat.installPropaneResponder("GitHubber", "githubber");
}

