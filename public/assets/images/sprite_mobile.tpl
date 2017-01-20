{{#options}}%{{extentName}}{{/options}}{
  {{#spritesheet}}
  background: url("{{image}}") 0 0 no-repeat;
  background-size: ({{width}}rem/100) ({{height}}rem/100);
  {{/spritesheet}}
}
{{#sprites}}
@mixin icon-{{name}} {
  background-position: (({{offset_x}} + 2) * 1rem/100) (({{offset_y}} + 2) * 1rem/100);
}
{{/sprites}}
