/* Add Syntaxhighlighter to Campfire */

var highlighter = true;
if (highlighter)
{
  Campfire.Highlighter = Class.create({
    initialize: function(chat) {
      this.chat = chat;
      var messages = this.chat.transcript.messages;
      for(var i = 0; i < messages.length; i++) {
        this.detectSyntax(messages[i]);
      }
      SyntaxHighlighter.highlight();
    },

    onMessagesInserted: function(messages) {
      var scrolledToBottom = this.chat.windowmanager.isScrolledToBottom();
      for (var i = 0; i < messages.length; i++) {
        this.detectSyntax(messages[i]);
      }
      SyntaxHighlighter.highlight();

      if (scrolledToBottom) {
        this.chat.windowmanager.scrollToBottom();
      }
    },

    onMessageAccepted: function(message) {
      this.detectSyntax(message);
      SyntaxHighlighter.highlight();
    },

    detectSyntax: function(message) {
      if (!message.pending() && (message.kind == 'text' || message.kind == 'paste')) {
        message.bodyCell.update(
          message.bodyCell.innerHTML.replace(
            /\n/g, '!@#'
          ).replace(
            /<code>(.+)<\/code>/, '$1'
          ).replace(
            /\[(as3|actionscript3|bash|shell|cf|coldfusion|c-sharp|csharp|cpp|c|css|delphi|pas|pascal|diff|patch|erl|erlang|groovy|js|jscript|javascript|java|jfx|javafx|perl|pl|php|plain|text|ps|powershell|py|python|rails|ror|ruby|scala|sql|vb|vbnet|xml|xhtml|sxlt|html)\](.+)$/, '<pre class="brush: $1">$2</pre>'
          ).replace(
            /\!\@\#/g, "\n"
          )
        );
      }
    }
  });

  Campfire.Responders.push("Highlighter");
  window.chat.installPropaneResponder("Highlighter", "highlighter");
}
