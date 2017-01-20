{{#options}}%{{extentName}}{{/options}}{
    {{#spritesheet}}
    background: url("{{image}}") 0 0 no-repeat;
    {{/spritesheet}}
}
{{#sprites}}
@mixin icon-{{name}} {
    background-position: {{px.offset_x}} {{px.offset_y}};
}
{{/sprites}}
