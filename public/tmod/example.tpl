{{if admin}}
    <p>admin</p>
{{else if code > 0}}
    <p>master</p>
{{else}}
    <p>error!</p>
{{/if}}

{{each list as value index}}
    <li>{{index}} - {{value.user}}</li>
{{/each}}