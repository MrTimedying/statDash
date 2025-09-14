// Chart Export Utilities

export const exportChartAsImage = async (elementId: string, filename: string = 'chart') => {
  try {
    // Dynamic import to reduce bundle size
    const html2canvas = await import('html2canvas');
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error('Chart element not found');
    }

    const canvas = await html2canvas.default(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('Chart export failed:', error);
    return false;
  }
};

export const exportChartAsSVG = async (elementId: string, filename: string = 'chart') => {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error('Chart element not found');
    }

    // Look for SVG elements within the chart container
    const svgElement = element.querySelector('svg');

    if (!svgElement) {
      throw new Error('No SVG found in chart element');
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('SVG export failed:', error);
    return false;
  }
};

export const exportAllChartsAsZip = async (chartIds: string[], baseName: string = 'charts') => {
  try {
    // Dynamic import for JSZip
    const JSZip = await import('jszip');
    const zip = new JSZip.default();

    // Export each chart and add to zip
    for (let i = 0; i < chartIds.length; i++) {
      const chartId = chartIds[i];
      const element = document.getElementById(chartId);

      if (element) {
        const html2canvas = await import('html2canvas');
        const canvas = await html2canvas.default(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/png');
        });

        zip.file(`chart_${i + 1}_${chartId}.png`, blob);
      }
    }

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Zip export failed:', error);
    return false;
  }
};