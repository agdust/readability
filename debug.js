const fs = require('node:fs');
const path = require('node:path');

(function(){
  const testPageName = process.argv[2];
  if (typeof testPageName !== 'string' || !testPageName.length) {
    console.error('Provide test page name. Example: npm run debug -- wikipedia-2');
    return;
  }

  let testPageContent = fs.readFileSync(
    path.join(
      process.cwd(),
      'test',
      'test-pages',
      testPageName,
      'source.html'
    ),
    'utf-8'
  );

  const readabilityScriptContent = fs.readFileSync(
    path.join(process.cwd(), 'Readability.js'),
    'utf-8',
  )

  const readerableScriptContent = fs.readFileSync(
    path.join(process.cwd(), 'Readability-readerable.js'),
    'utf-8',
  )

  const styles = `
      <style>
      body._readabilityDebug ._readabilityDebug_deleted {
        box-shadow: inset 0px 0px 0 2000px rgba(255, 0, 0, 0.2);
      }
      body._readabilityDebug ._readabilityDebug_preserved {
        box-shadow: inset 0px 0px 0 2000px rgba(0, 255, 0, 0.2);
      }
    </style>
  `

  const scripts = `
    <script>
      document.body.classList.add('_readabilityDebug');

      window._markElement = function (element, role, reason) {
        // if (node.tagName === 'style') return;
        element.classList.add(\`_readabilityDebug_\${role}\`)
        element.title = \`\${role} because \${reason}\`
      }

      ${readabilityScriptContent}

      ${readerableScriptContent}

      const reader = new Readability(document, { debug: true }).parse();
    </script>
  `;

  if (testPageContent.indexOf('</body>') < 0) {
    console.error('No </body> was found in provided html file')
    return;
  }

  testPageContent = testPageContent.replace('</head>', `${styles}</head>`)
  testPageContent = testPageContent.replace('</body>', `${scripts}</body>`)

  fs.writeFileSync(path.join(process.cwd(), 'debug-page.html'), testPageContent);
})()
