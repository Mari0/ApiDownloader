'use strict';

module.exports = function(grunt){
    var _ = grunt.util._;
    var keys = grunt.file.readJSON('KeyCollection.json');
    grunt.file.mkdir('api');
    grunt.registerTask('generateConfigs', 'a simple template engine to add keys to the API config files', function(){
        grunt.file.recurse('configs', function(abs, root, sub, name){
           var apiConfig = grunt.file.read(abs).toString();
            var n = name.replace(/.json/g,"");
            var tpl = _.template(apiConfig);
            var config = tpl({key:keys[n]});
            grunt.file.write('api\\' + name, config);
        });
        debugger;

    });
};