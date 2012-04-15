/*
  As of version 1.1.2, Propane will load and execute the contents of
  ~Library/Application Support/Propane/unsupported/caveatPatchor.js
  immediately following the execution of its own enhancer.js file.

  You can use this mechanism to add your own customizations to Campfire
  in Propane.

  Below you'll find two customization examples.

  2 - A responder that displays CloudApp images inline

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
var displayCloudAppImages = true;

/* 
  Display CloudApp images inline.

  This responder illustrates using Propane's requestJSON service to request 
  JSON from remote (non-authenticated) servers and have the results passed
  to a callback of your choosing.
*/

if (displayCloudAppImages) {

  Campfire.CloudAppExpander = Class.create({
    initialize: function(chat) {
      this.chat = chat;
      var messages = this.chat.transcript.messages;
      for (var i = 0; i < messages.length; i++) {
        this.detectCloudAppURL(messages[i]);
      }
    },

    detectCloudAppURL: function(message) {
      /* we are going to use the messageID to uniquely identify our requestJSON request
         so we don't check pending messages */
      if (!message.pending() && message.kind === 'text') {
        var links = message.bodyElement().select('a:not(image)');
        if (links.length != 1) {
          return;
        }
        var href = links[0].getAttribute('href');
        var match = href.match(/^https?:\/\/cl.ly\/[A-Za-z0-9]+\/?$/);
        if (!match) return;
        window.propane.requestJSON(message.id(), href, 'window.chat.cloudappexpander', 'onEmbedDataLoaded', 'onEmbedDataFailed');
      }
    },

    onEmbedDataLoaded: function(messageID, data) {
      var message = window.chat.transcript.getMessageById(messageID);
      if (!message) return;

      if (data['item_type'] === 'image') {
        var imageURL = data['content_url'];
        message.resize((function() {
          message.bodyCell.insert({bottom: '<div style="width:100%; margin-top:5px; padding-top: 5px; border-top:1px dotted #ccc;"><a href="'+imageURL+'" class="image loading" target="_blank">' + '<img src="'+imageURL+'" onload="$dispatch(&quot;inlineImageLoaded&quot;, this)" onerror="$dispatch(&quot;inlineImageLoadFailed&quot;, this)" /></a></div>'});
        }).bind(this));
      }
    },

    onEmbedDataFailed: function(messageID) {
      /* No cleanup required, we only alter the HTML after we get back a succesful load from the data */
    },

    onMessagesInsertedBeforeDisplay: function(messages) {
      for (var i = 0; i < messages.length; i++) {
        this.detectCloudAppURL(messages[i]);
      }
    },

    onMessageAccepted: function(message, messageID) {
      this.detectCloudAppURL(message);
    }
  });

  Campfire.Responders.push("CloudAppExpander");
  window.chat.installPropaneResponder("CloudAppExpander", "cloudappexpander");
}

