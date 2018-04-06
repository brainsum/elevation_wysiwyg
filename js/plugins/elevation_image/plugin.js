/**
 * @file
 * Elevation_wysiwyg plugin.
 *
 * This alters the existing CKEditor image2 widget plugin, which is already
 * altered by the Drupal Image plugin, to:
 * - modify UI for Drupal Image plugin and behaviors.
 *
 * @ignore
 */

(function (CKEDITOR) {

  'use strict';

  CKEDITOR.plugins.add('elevation_image', {
    icons: 'DoubleImage',
    requires: 'drupalimagecaption',
    hidpi: true,

    beforeInit: function (editor) {
      // Override the image2 widget definition to handle the additional
      // data-align and data-caption attributes.
      editor.on('widgetDefinition', function (event) {
        var widgetDefinition = event.data;
        if (widgetDefinition.name !== 'image') {
          return;
        }

        widgetDefinition.allowedContent.img.attributes['!width'] = true;
        widgetDefinition.allowedContent.img.attributes['!height'] = true;

        // Override downcast(): ensure we *only* output <img>, but also ensure
        // we include the data-entity-type, data-entity-uuid, data-align and
        // data-caption attributes.
        var originalDowncast = widgetDefinition.downcast;
        widgetDefinition.downcast = function (element) {
          var img = findElementByName(element, 'img');
          originalDowncast.call(this, img);
          return img;
        };

        // We want to upcast <img> elements to a DOM structure required by the
        // image2 widget. Depending on a case it may be:
        //   - just an <img> tag (non-captioned, not-centered image),
        //   - <img> tag in a paragraph (non-captioned, centered image),
        //   - <figure> tag (captioned image).
        // We take the same attributes into account as downcast() does.
        var originalUpcast = widgetDefinition.upcast;
        widgetDefinition.upcast = function (element, data) {
          if (element.name !== 'img' || !element.attributes['data-entity-type'] || !element.attributes['data-entity-uuid']) {
            return;
          }
          // Don't initialize on pasted fake objects.
          else if (element.attributes['data-cke-realelement']) {
            return;
          }

          element = originalUpcast.call(this, element, data);

          return element;
        };

        // Override Drupal dialog save callback.
        widgetDefinition._createDialogSaveCallback = function (editor, widget) {
          return function (dialogReturnValues) {
            var firstEdit = !widget.ready;

            if (!firstEdit) {
              widget.focus();
            }
            
            editor.fire('saveSnapshot');

            var container = widget.wrapper.getParent(true);
            var image = widget.parts.image;
            var data = widgetDefinition._dialogValuesToData(dialogReturnValues.attributes);

            if(typeof data.align !== 'undefined') {
              switch (data.align) {
                case 'center':
                  data.width = 630;
                  break;

                case 'left':
                case 'right':
                  data.width = 250;
                  break;
              
                default:
                  break;
              }
            }

            widget.setData(data);

            widget = editor.widgets.getByElement(image);

            if (firstEdit) {
              editor.widgets.finalizeCreation(container);
            }

            setTimeout(function () {
              widget.focus();
              editor.fire('saveSnapshot');
            });

            return widget;
          };
        };
      });

      setTimeout(function () {
        // Register the "editdrupalimage" command, which essentially just replaces
        // the "image" command's CKEditor dialog with a Drupal-native dialog.
        editor.addCommand('editdrupalimage', {
          allowedContent: 'img[alt,!src,width,height,!data-entity-type,!data-entity-uuid]',
          requiredContent: 'img[alt,src,data-entity-type,data-entity-uuid]',
          modes: {wysiwyg: 1},
          canUndo: true,
          exec: function (editor, data) {
            var dialogSettings = {
              title: data.dialogTitle,
              dialogClass: 'editor-image-dialog'
            };
            Drupal.ckeditor.openDialog(editor, Drupal.url('elevation_wysiwyg/dialog/single_image/' + editor.config.drupal.format), data.existingValues, data.saveCallback, dialogSettings);
          }
        });
        // Low priority to ensure drupalimage's event handler runs first.
      }, 30);

      var imageSaveCallback = function (data) {
        editor.fire('saveSnapshot');
        var content = data.image_render;
        editor.insertHtml(content);
        editor.fire('saveSnapshot');
      };

      // Implementation before initializing plugin.
      editor.addCommand('InsertDoubleImage', {
        canUndo: true,
        exec: function (editor, data) {
          Drupal.ckeditor.openDialog(editor,
            Drupal.url('elevation_wysiwyg/dialog/double_image/' + editor.config.drupal.format),
            {},
            imageSaveCallback,
            {}
          );
        }
      });

      // Register the toolbar button.
      if (editor.ui.addButton) {
        editor.ui.addButton('DoubleImage', {
          label: Drupal.t('Upload Double Image'),
          command: 'InsertDoubleImage'
        });
      }
    }
  });

  /**
   * Finds an element by its name.
   *
   * Function will check first the passed element itself and then all its
   * children in DFS order.
   *
   * @param {CKEDITOR.htmlParser.element} element
   *   The element to search.
   * @param {string} name
   *   The element name to search for.
   *
   * @return {?CKEDITOR.htmlParser.element}
   *   The found element, or null.
   */
  function findElementByName(element, name) {
    if (element.name === name) {
      return element;
    }

    var found = null;
    element.forEach(function (el) {
      if (el.name === name) {
        found = el;
        // Stop here.
        return false;
      }
    }, CKEDITOR.NODE_ELEMENT);
    return found;
  }

})(CKEDITOR);
