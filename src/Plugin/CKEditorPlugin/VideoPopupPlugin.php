<?php

namespace Drupal\elevation_wysiwyg\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginConfigurableInterface;
use Drupal\editor\Entity\Editor;
use Drupal\video_embed_wysiwyg\Plugin\CKEditorPlugin\VideoEmbedWysiwyg;

/**
 * Defines the "elevation_wysiwyg" plugin.
 *
 * @CKEditorPlugin(
 *   id = "elevation_video",
 *   label = @Translation("Elevation Popup for video"),
 *   module = "elevation_wysiwyg"
 * )
 */
class VideoPopupPlugin extends VideoEmbedWysiwyg implements CKEditorPluginConfigurableInterface {

  /**
   * {@inheritdoc}
   */
  public function isInternal() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getLibraries(Editor $editor) {
    return array(
      'core/drupal.ajax',
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return drupal_get_path('module', 'elevation_wysiwyg') . '/js/plugins/elevation_video/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function isEnabled(Editor $editor) {
    $settings = $editor->getSettings();
    foreach ($settings['toolbar']['rows'] as $row) {
      foreach ($row as $group) {
        foreach ($group['items'] as $button) {
          if ($button === 'video_embed') {
            return TRUE;
          }
        }
      }
    }

    return FALSE;
  }

}
