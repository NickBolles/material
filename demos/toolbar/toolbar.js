/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.10.1-rc1
 */
(function( window, angular, undefined ){
"use strict";

/**
 * @ngdoc module
 * @name material.components.toolbar
 */
angular.module('material.components.toolbar', [
  'material.core',
  'material.components.content'
])
  .directive('mdToolbar', mdToolbarDirective);

/**
 * @ngdoc directive
 * @name mdToolbar
 * @module material.components.toolbar
 * @restrict E
 * @description
 * `md-toolbar` is used to place a toolbar in your app.
 *
 * Toolbars are usually used above a content area to display the title of the
 * current page, and show relevant action buttons for that page.
 *
 * You can change the height of the toolbar by adding either the
 * `md-medium-tall` or `md-tall` class to the toolbar.
 *
 * @usage
 * <hljs lang="html">
 * <div layout="column" layout-fill>
 *   <md-toolbar>
 *
 *     <div class="md-toolbar-tools">
 *       <span>My App's Title</span>
 *
 *       <!-- fill up the space between left and right area -->
 *       <span flex></span>
 *
 *       <md-button>
 *         Right Bar Button
 *       </md-button>
 *     </div>
 *
 *   </md-toolbar>
 *   <md-content>
 *     Hello!
 *   </md-content>
 * </div>
 * </hljs>
 *
 * @param {boolean=} md-scroll-shrink Whether the header should shrink away as
 * the user scrolls down, and reveal itself as the user scrolls up.
 * Note: for scrollShrink to work, the toolbar must be a sibling of a
 * `md-content` element, placed before it. See the scroll shrink demo.
 *
 *
 * @param {number=} md-shrink-speed-factor How much to change the speed of the toolbar's
 * shrinking by. For example, if 0.25 is given then the toolbar will shrink
 * at one fourth the rate at which the user scrolls down. Default 0.5.
 *
 * @param {boolean=} md-scroll-fade Whether the header should fade from a picture/backdrop
 * to the toolbar as the user scrolls down. The toolbar must be a sibling of `md-content` and
 * contain an element with the attribute `md-toolbar-expanded`, which will be the backdrop
 * when fully down. Optionally the toolbar can contain a `md-fab` with the attribute
 * `md-toolbar-fab` and a title with the attribute `md-toolbar-title` to animate from the bottom
 * of the toolbar to the normal toolbar position.
 * Note: Use this in conjunction with md-keep-condensed to keep the header when scrolling down.
 * Note: Use a container with the class `.md-toolbar-tools`
 *
 * @param {number=} md-keep-condensed Whether the header should stay at the specified ammount,
 * or scroll of the screen. This is only applicable to toolbars with the `md-scroll-fade` or
 * `md-scroll-shrink` attributes. Default 64px.
 *
 * @param {number=} md-title-scale-factor How much to increase the scale of the toolbar's
 * title by. For example, if 2 is given then the toolbar's title will grow to twice its
 * normal size when the content is scrolled all the way up and transition back its normal
 * location and normal size as the content is scrolled down. Only applicable to a toolbar with
 * `md-scroll-fade` and an element within the toolbar with the attribute `md-toolbar-title`
 * Default 1.5.
 */

function mdToolbarDirective($$rAF, $mdConstant, $mdUtil, $mdTheming, $animate ) {
  var translateY = angular.bind(null, $mdUtil.supplant, 'translate3d(0,{0}px,0)' );

  return {
    restrict: 'E',
    controller: angular.noop,
    link: function(scope, element, attr) {

      $mdTheming(element);

      if (angular.isDefined(attr.mdScrollShrink) || angular.isDefined(attr.mdScrollFade)) {
        setupScrollShrink();
      }

      function setupScrollShrink() {
        // Current "y" position of scroll
        var y = 0;
        // Store the last scroll top position
        var prevScrollTop = 0;

        var shrinkSpeedFactor = attr.mdShrinkSpeedFactor || 0.5;

        var toolbarHeight;
        var toolbarMinHeight = 0;
        var MIN_ANIMATE_HEIGHT = 64;

        var contentElement;
        var expandedElement;

        var toolbarTools;
        var toolbarTitle;
        var titleScaleFactor = attr.mdTitleScaleFactor || 1.5;
        var toolbarFab;

        if (angular.isDefined(attr.mdScrollFade)) {
          expandedElement = angular.element(element[0].querySelector('[md-toolbar-expanded]'));
          if (expandedElement[0]) {
            expandedElement.css("opacity", 1);
            expandedElement.addClass("fill-height");
          }
          toolbarTitle = angular.element(element[0].querySelector('[md-toolbar-title]'));
          toolbarTitle.css('transform-origin', '24px');
          toolbarTools = angular.element(element[0].querySelector('.md-toolbar-tools'));
          toolbarFab = angular.element(element[0].querySelector('[md-toolbar-fab]'));
        }
        if (angular.isDefined(attr.mdKeepCondensed)) {
          toolbarMinHeight = parseInt(attr.mdKeepCondensed) || 64;
        }

        var debouncedContentScroll = $$rAF.throttle(onContentScroll);
        var debouncedUpdateHeight = $mdUtil.debounce(updateToolbarHeight, 5 * 1000);

        // Wait for $mdContentLoaded event from mdContent directive.
        // If the mdContent element is a sibling of our toolbar, hook it up
        // to scroll events.
        scope.$on('$mdContentLoaded', onMdContentLoad);

        function onMdContentLoad($event, newContentEl) {
          // Toolbar and content must be siblings
          if (element.parent()[0] === newContentEl.parent()[0]) {
            // unhook old content event listener if exists
            if (contentElement) {
              contentElement.off('scroll', debouncedContentScroll);
            }

            newContentEl.on('scroll', debouncedContentScroll);
            if (angular.isDefined(attr.mdScrollFade)) {
              newContentEl.attr('scroll-fade-content', 'true');
            } else {
              newContentEl.attr('scroll-shrink', 'true');
            }

            contentElement = newContentEl;
            $$rAF(updateToolbarHeight);
          }
        }

        function updateToolbarHeight() {
          toolbarHeight = element.prop('offsetHeight');
          // Add a negative margin-top the size of the toolbar to the content el.
          // The content will start transformed down the toolbarHeight amount,
          // so everything looks normal.
          //
          // As the user scrolls down, the content will be transformed up slowly
          // to put the content underneath where the toolbar was.
          var margin =  (-toolbarHeight * shrinkSpeedFactor) + 'px';
          contentElement.css('margin-top', margin);
          contentElement.css('margin-bottom', margin);


          onContentScroll();
        }

        function onContentScroll(e) {
          var scrollTop = e ? e.target.scrollTop : prevScrollTop;

          debouncedUpdateHeight();

          y = Math.min(
            toolbarHeight / shrinkSpeedFactor,
            Math.max(0, y + scrollTop - prevScrollTop)
          );
          var curRatio = 1 - y * shrinkSpeedFactor / (toolbarHeight - MIN_ANIMATE_HEIGHT);


          if (y <= ((toolbarHeight - toolbarMinHeight) / shrinkSpeedFactor)) {
            element.css( $mdConstant.CSS.TRANSFORM, translateY([-y * shrinkSpeedFactor]) );
            contentElement.css( $mdConstant.CSS.TRANSFORM, translateY([(toolbarHeight - y) * shrinkSpeedFactor]) );
            //If this is a scroll fade toolbar set the opacity on the expanded Element
            // and do the transitions on the title, fab and tools
            if (angular.isDefined(attr.mdScrollFade) && angular.isDefined(expandedElement)) {
              expandedElement.css("opacity", curRatio);
              //If we are scrolled more then the MIN_ANIMATE_HEIGHT (64) scroll the tools and title
              if (y<=(toolbarHeight + MIN_ANIMATE_HEIGHT)){
                toolbarTools.css( $mdConstant.CSS.TRANSFORM, translateY([y * shrinkSpeedFactor]) );
                var curScale = (titleScaleFactor - 1) * curRatio + 1;
                toolbarTitle.css(
                  $mdConstant.CSS.TRANSFORM,
                  'translate3d(0,' + (curRatio * (toolbarHeight - MIN_ANIMATE_HEIGHT)) + 'px,0) scale(' + curScale + ',' + curScale + ')'
                );
              }
              if (y >= (toolbarHeight - MIN_ANIMATE_HEIGHT) * 1.2) {
                toolbarFab.addClass("hide");
                toolbarFab.removeClass("show");
              } else {
                toolbarFab.removeClass("hide");
                toolbarFab.addClass("show");
              }
            }
          }

          prevScrollTop = scrollTop;

          $mdUtil.nextTick(function () {
            var hasWhiteFrame = element.hasClass('md-whiteframe-z1');

            if ( hasWhiteFrame && !y) {
              $animate.removeClass(element, 'md-whiteframe-z1');
            } else if ( !hasWhiteFrame && y ) {
              $animate.addClass(element, 'md-whiteframe-z1');
            }
          });

        }

      }

    }
  };

}
mdToolbarDirective.$inject = ["$$rAF", "$mdConstant", "$mdUtil", "$mdTheming", "$animate"];

})(window, window.angular);