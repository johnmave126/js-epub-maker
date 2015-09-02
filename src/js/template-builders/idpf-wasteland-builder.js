/* global module, exports, JSZip, JSZipUtils */
(function() {
    'use strict';
    
    var baseUrl = 'dist/epub_templates/from_idpf_epub3/wasteland';
    
    var builder = new function() {
        
        
        this.make = function(epubConfig) {
            console.debug('building epub', epubConfig);
            var zip = new JSZip();
            
            var deferred = $.Deferred();
            $.when(
                addMimetype(zip),
                addContainerInfo(zip),
                addManifestOpf(zip),
                addCover(zip),
                addEpub2Nav(zip),
                addEpub3Nav(zip),
                addStylesheets(zip),
                addContent(zip)
            ).then(function() {
                deferred.resolve(zip);
            });
            
			zip.file("Hello.txt", "Hello World\n");
            return deferred.promise();
        };
        
        function addMimetype(zip) {
            return $.get(baseUrl + '/mimetype', function(file) {
               zip.file('mimetype', file);
            }, 'text');
        }
        
        function addContainerInfo(zip) {
            return $.get(baseUrl + '/META-INF/container.xml', function(file) {
               zip.folder('META-INF').file('container.xml', file);
            }, 'text');
        }
        
        function addManifestOpf(zip) {
            return $.get(baseUrl + '/EPUB/wasteland.opf', function(file) {
               zip.folder('EPUB').file('wasteland.opf', file);
            }, 'text');
        }
        
        function addCover(zip) {
            var p = $.Deferred();
            JSZipUtils.getBinaryContent(baseUrl + '/EPUB/wasteland-cover.jpg', function (err, data) {
                if (!err) {
                    zip.folder('EPUB').file('wasteland-cover.jpg', data, { binary: true });
                    p.resolve('');
                } else {
                    p.reject(err);
                }
            });
            return p.promise();
        }
        
        function addEpub2Nav(zip) {
            return $.get(baseUrl + '/EPUB/wasteland.ncx', function(file) {
               zip.folder('EPUB').file('wasteland.ncx', file);
            }, 'text');
        }
        
        function addEpub3Nav(zip) {
            return $.get(baseUrl + '/EPUB/wasteland-nav.xhtml', function(file) {
               zip.folder('EPUB').file('wasteland-nav.xhtml', file);
            }, 'text');
        }
        
        function addStylesheets(zip) {
            return $.when(
                $.get(baseUrl + '/EPUB/wasteland.css', function(file) {
                   zip.folder('EPUB').file('wasteland.css', file);
                }, 'text'),
                $.get(baseUrl + '/EPUB/wasteland-night.css', function(file) {
                   zip.folder('EPUB').file('wasteland-night.css', file);
                }, 'text')
            );
        }
        
        function addContent(zip) {
            return $.get(baseUrl + '/EPUB/wasteland-content.xhtml', function(file) {
               zip.folder('EPUB').file('wasteland-content.xhtml', file);
            }, 'text');
        }
    };

    // manage dependency exports
    if (typeof module !== 'undefined') {
        module.exports.builder = builder;
    }
    else if (typeof exports !== 'undefined') {
        exports.builder = builder;
    }
    else if (typeof window === 'undefined') {
        throw new Error('unable to expose module: no module, exports object and no global window detected');
    }

    if (typeof window !== 'undefined') {
        window.epubMaker = builder;
    }
}());