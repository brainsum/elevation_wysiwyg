<?php
/**
 * Created by PhpStorm.
 * User: Marton
 * Date: 2017. 09. 13.
 * Time: 17:52
 */

namespace Drupal\elevation_wysiwyg\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\image\Entity\ImageStyle;
use Drupal\Core\Url;

/**
 * Class ImagePopup.
 *
 * @package Drupal\elevation_wysiwyg\Controller
 */
class ImagePopup extends ControllerBase {
  /**
   * Render.
   *
   * @return array
   *   Return Hello string.
   */
  public function render($fid, $image_style = NULL) {
    $file = \Drupal::entityTypeManager()->getStorage('file')->load($fid);

    if (!empty($image_style)) {
      $image_style = ImageStyle::load($image_style);
    }
    $image_uri = $file->getFileUri();

    if (!empty($image_style)) {
      $absolute_path = ImageStyle::load($image_style->getName())->buildUrl($image_uri);
    }
    else {
      // Get absolute path for original image.
      $absolute_path = Url::fromUri(file_create_url($image_uri))->getUri();
    }
    return array(
      '#theme' => 'image_popup_details',
      '#url_popup' => $absolute_path,
    );
  }

}