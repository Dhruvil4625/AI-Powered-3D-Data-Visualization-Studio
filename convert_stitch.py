import re
import os

def clean_html_to_jsx(content):
    # Class to className
    content = content.replace('class=', 'className=')
    content = content.replace('<!--', '{/*')
    content = content.replace('-->', '*/}')
    
    # SVG attributes
    content = content.replace('viewbox=', 'viewBox=')
    content = content.replace('stroke-width=', 'strokeWidth=')
    content = content.replace('stop-color=', 'stopColor=')
    content = content.replace('stop-opacity=', 'stopOpacity=')
    content = content.replace('lineargradient', 'linearGradient')
    
    # Specific style conversions
    content = content.replace('style="font-variation-settings: \'FILL\' 0;"', 'style={{ fontVariationSettings: "\'FILL\' 0" }}')
    content = content.replace('style="font-variation-settings: \'FILL\' 1;"', 'style={{ fontVariationSettings: "\'FILL\' 1" }}')
    
    # Clean up empty styles
    content = content.replace('style=""', '')
    
    # Regex for width styles: style="width: 94%" -> style={{ width: "94%" }}
    content = re.sub(r'style="width:\s*([^"]+)"', r'style={{ width: "\1" }}', content)
    
    # Self-closing tags strictly for React
    content = re.sub(r'<img([^>]+)(?<!/)>', r'<img\1/>', content)
    content = re.sub(r'<input([^>]+)(?<!/)>', r'<input\1/>', content)
    content = re.sub(r'<br(?:[^>]*)(?<!/)>', r'<br />', content)
    content = re.sub(r'<hr(?:[^>]*)(?<!/)>', r'<hr />', content)
    content = re.sub(r'<path([^>]+)(?<!/)>', r'<path\1/>', content)
    content = re.sub(r'<polygon([^>]+)(?<!/)>', r'<polygon\1/>', content)
    content = re.sub(r'<stop([^>]+)(?<!/)>', r'<stop\1/>', content)
    
    return content

def convert_file(html_path, out_path, component_name):
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    body_start = html.find('<body')
    body_end = html.find('</body>')
    body_tag_end = html.find('>', body_start) + 1
    
    content = html[body_tag_end:body_end]
    content = clean_html_to_jsx(content)
    
    # Replace standard navigation tags with React Router Link components
    content = content.replace('<a ', '<Link ')
    content = content.replace('</a>', '</Link>')
    content = content.replace('href="#"', 'to="#"')

    tsx = f"""import React from 'react';
import {{ Link }} from 'react-router-dom';

export const {component_name}: React.FC = () => {{
  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb] font-['Inter'] relative overflow-x-hidden">
      {{/* STITCH GENERATED UI */}}
      {content}
    </div>
  );
}};
"""
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(tsx)

convert_file('stitch_report.html', 'src/components/views/DataQualityReportView.tsx', 'DataQualityReportView')
convert_file('stitch_dist.html', 'src/components/views/DataDistributionAnalysisView.tsx', 'DataDistributionAnalysisView')
print("Successfully generated React TSX components from HTML templates.")
