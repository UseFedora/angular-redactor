if (!RedactorPlugins) var RedactorPlugins = {};

if (!RedactorPlugins) var RedactorPlugins = {};

  RedactorPlugins.fontsize = function()
  {
    return {
      init: function()
      {
        var fonts = [10, 11, 12, 14, 16, 18, 20, 24, 28, 30];
        var that = this;
        var dropdown = {};

        $.each(fonts, function(i, s)
        {
          dropdown['s' + i] = { title: s + 'px', func: function() { that.fontsize.set(s); } };
        });

        dropdown.remove = { title: 'Remove Font Size', func: that.fontsize.reset };

        var button = this.button.add('fontsize', 'Change Font Size');
        this.button.addDropdown(button, dropdown);
      },
      set: function(size)
      {
        this.inline.format('span', 'style', 'font-size: ' + size + 'px;');
      },
      reset: function()
      {
        this.inline.removeStyleRule('font-size');
      }
    };
  };


  RedactorPlugins.fontfamily = function()
  {
    return {
      init: function ()
      {
        var fonts = [ 'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Monospace' ];
        var that = this;
        var dropdown = {};

        $.each(fonts, function(i, s)
        {
          dropdown['s' + i] = { title: s, func: function() { that.fontfamily.set(s); }};
        });

        dropdown.remove = { title: 'Remove Font Family', func: that.fontfamily.reset };

        var button = this.button.add('fontfamily', 'Change Font Family');
        this.button.addDropdown(button, dropdown);

      },
      set: function (value)
      {
        this.inline.format('span', 'style', 'font-family:' + value + ';');
      },
      reset: function()
      {
        this.inline.removeStyleRule('font-family');
      }
    };
  };

  RedactorPlugins.fontcolor = function()
  {
    return {
      init: function()
      {
        var colors = [
          '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
          '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
          '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
          '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
          '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
          '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b',  '#974806', '#7f6000'
        ];

        var buttons = ['fontcolor', 'backcolor'];

        for (var i = 0; i < 2; i++)
        {
          var name = buttons[i];

          var button = this.button.add(name, this.lang.get(name));
          var $dropdown = this.button.addDropdown(button);

          $dropdown.width(242);
          this.fontcolor.buildPicker($dropdown, name, colors);

        }
      },
      buildPicker: function($dropdown, name, colors)
      {
        var rule = (name == 'backcolor') ? 'background-color' : 'color';

        var len = colors.length;
        var self = this;
        var func = function(e)
        {
          e.preventDefault();
          self.fontcolor.set($(this).data('rule'), $(this).attr('rel'));
        };

        for (var z = 0; z < len; z++)
        {
          var color = colors[z];

          var $swatch = $('<a rel="' + color + '" data-rule="' + rule +'" href="#" style="float: left; font-size: 0; border: 2px solid #fff; padding: 0; margin: 0; width: 22px; height: 22px;"></a>');
          $swatch.css('background-color', color);
          $swatch.on('click', func);

          $dropdown.append($swatch);
        }

        var $elNone = $('<a href="#" style="display: block; clear: both; padding: 5px; font-size: 12px; line-height: 1;"></a>').html(this.lang.get('none'));
        $elNone.on('click', $.proxy(function(e)
        {
          e.preventDefault();
          this.fontcolor.remove(rule);

        }, this));

        $dropdown.append($elNone);
      },
      set: function(rule, type)
      {
        this.inline.format('span', 'style', rule + ': ' + type + ';');
      },
      remove: function(rule)
      {
        this.inline.removeStyleRule(rule);
      }
    };
  };

  RedactorPlugins.fullscreen = function()
  {
    return {
      init: function()
      {
        this.fullscreen.isOpen = false;

        var button = this.button.add('fullscreen', 'Fullscreen');
        this.button.addCallback(button, this.fullscreen.toggle);

        if (this.opts.fullscreen) this.fullscreen.toggle();
      },
      enable: function()
      {
        this.button.changeIcon('fullscreen', 'normalscreen');
        this.button.setActive('fullscreen');
        this.fullscreen.isOpen = true;

        if (this.opts.toolbarExternal)
        {
          this.fullscreen.toolcss = {};
          this.fullscreen.boxcss = {};
          this.fullscreen.toolcss.width = this.$toolbar.css('width');
          this.fullscreen.toolcss.top = this.$toolbar.css('top');
          this.fullscreen.toolcss.position = this.$toolbar.css('position');
          this.fullscreen.boxcss.top = this.$box.css('top');
        }

        this.fullscreen.height = this.$editor.height();

        if (this.opts.maxHeight) this.$editor.css('max-height', '');
        if (this.opts.minHeight) this.$editor.css('min-height', '');

        if (!this.$fullscreenPlaceholder) this.$fullscreenPlaceholder = $('<div/>');
        this.$fullscreenPlaceholder.insertAfter(this.$box);

        this.$box.appendTo(document.body);

        this.$box.addClass('redactor-box-fullscreen');
        $('body, html').css('overflow', 'hidden');

        this.fullscreen.resize();
        $(window).on('resize.redactor.fullscreen', $.proxy(this.fullscreen.resize, this));
        $(document).scrollTop(0, 0);

        $('.redactor-toolbar-tooltip').hide();
        this.$editor.focus();
        this.observe.load();
      },
      disable: function()
      {
        this.button.removeIcon('fullscreen', 'normalscreen');
        this.button.setInactive('fullscreen');
        this.fullscreen.isOpen = false;

        $(window).off('resize.redactor.fullscreen');
        $('body, html').css('overflow', '');

        this.$box.insertBefore(this.$fullscreenPlaceholder);
        this.$fullscreenPlaceholder.remove();

        this.$box.removeClass('redactor-box-fullscreen').css({ width: 'auto', height: 'auto' });

        this.code.sync();

        if (this.opts.toolbarExternal)
        {
          this.$box.css('top', this.fullscreen.boxcss.top);
          this.$toolbar.css({
            'width': this.fullscreen.toolcss.width,
            'top': this.fullscreen.toolcss.top,
            'position': this.fullscreen.toolcss.position
          });
        }

        if (this.opts.minHeight) this.$editor.css('minHeight', this.opts.minHeight);
        if (this.opts.maxHeight) this.$editor.css('maxHeight', this.opts.maxHeight);

        $('.redactor-toolbar-tooltip').hide();
        this.$editor.css('height', 'auto');
        this.$editor.focus();
        this.observe.load();
      },
      toggle: function()
      {
        if (this.fullscreen.isOpen)
        {
          this.fullscreen.disable();
        }
        else
        {
          this.fullscreen.enable();
        }
      },
      resize: function()
      {
        if (!this.fullscreen.isOpen) return;

        var toolbarHeight = this.$toolbar.height();

        var height = $(window).height() - toolbarHeight - this.utils.normalize(this.$editor.css('padding-top')) - this.utils.normalize(this.$editor.css('padding-bottom'));
        this.$box.width($(window).width()).height(height);

        if (this.opts.toolbarExternal)
        {
          this.$toolbar.css({
            'top': '0px',
            'position': 'absolute',
            'width': '100%'
          });

          this.$box.css('top', toolbarHeight + 'px');
        }

        this.$editor.height(height);
      }
    };
  };

RedactorPlugins.filepicker = function() {
  return {
    init: function() {
      var button = this.button.add('filepicker', 'Add Image');
      this.button.addCallback(button, this.filepicker.show);

      // make your added button as Font Awesome's icon
      this.button.setAwesome('filepicker', 'fa-image');
    },
    show: function() {
      filepicker.pickAndStore({
        mimetype: 'image/*',
        container: 'modal',
        multiple: false,
        debug: false,
        maxSize: 2000 * 1024 * 1024,
        folders: false,
        services: [
          "COMPUTER",
          "IMAGE_SEARCH",
          "URL",
          "DROPBOX",
          "GOOGLE_DRIVE",
        ]
      }, {
        location:'S3',
        path:'/',
        access: 'public'
      }, this.filepicker.insert);

    },
    insert: function(object) {
      html = "<img class='img-responsive' src='" + object[0].url + "'>"
      this.insert.html(html);

      this.code.sync();

    }
  };
};

(function() {
    'use strict';

    /**
     * usage: <textarea ng-model="content" redactor></textarea>
     *
     *    additional options:
     *      redactor: hash (pass in a redactor options hash)
     *
     */
    var redactorOptions = {};
    angular.module('angular-redactor-filepicker', [])
        .constant('redactorOptions', redactorOptions)
        .directive('redactor', ['$timeout', function($timeout) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                  // Expose scope var with loaded state of Redactor
                    scope.redactorLoaded = false;

                        var updateModel = function() {
                            scope.$apply(ngModel.$setViewValue($_element.redactor('code.get')));
                        },
                        options = {
                            keyupCallback: updateModel,
                            keydownCallback: updateModel,
                            execCommandCallback: updateModel,
                            autosaveCallback: updateModel,
                            focusCallback: updateModel,
                            blurCallback: updateModel,
                            plugins: ['filepicker', 'fullscreen', 'fontcolor', 'fontsize', 'fontfamily'],
                            buttons: ['html', 'formatting', 'bold', 'italic', 'underline', 'orderedlist', 'unorderedlist', 'outdent', 'indent', 'image', 'file', 'link', 'alignment', 'horizontalrule'],
                            deniedTags: ['html', 'head', 'body', 'meta', 'applet'],
                            replaceDivs: false
                        },
                        additionalOptions = attrs.redactor ?
                            scope.$eval(attrs.redactor) : {},
                        editor,
                        $_element = angular.element(element);

                    angular.extend(options, redactorOptions, additionalOptions);

                    // prevent collision with the constant values on ChangeCallback
                    var changeCallback = additionalOptions.changeCallback || redactorOptions.changeCallback;
                    if (changeCallback) {
                        options.changeCallback = function(value) {
                            updateModel.call(this, value);
                            changeCallback.call(this, value);
                        }
                    }

                    // put in timeout to avoid $digest collision.  call render() to
                    // set the initial value.
                    $timeout(function() {
                        editor = $_element.redactor(options);
                        ngModel.$render();
                    });

                    ngModel.$render = function() {
                        if(angular.isDefined(editor)) {
                            $timeout(function() {
                                $_element.redactor('code.set', ngModel.$viewValue || '');
                                $_element.redactor('placeholder.toggle');
                                scope.redactorLoaded = true;
                            });
                        }
                    };
                }
            };
        }]);
})();

