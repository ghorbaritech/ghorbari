export function parseCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Handle quotes simply (splitting by comma might break if commas are in quotes, 
        // but for a simple "no dependency" parser this is often acceptable for basic usage. 
        // For robust parsing, we'd need a regex or state machine).
        // Let's use a slightly better regex split for quoted commas.
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');

        const row: any = {};
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to split by comma ignoring quotes

        headers.forEach((header, index) => {
            let value = values[index]?.trim();
            if (value && value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            row[header] = value;
        });

        results.push(row);
    }

    return results;
}

export function generateCSVTemplate() {
    const headers = ['title', 'sku', 'category', 'base_price', 'stock_quantity', 'description', 'is_quote_only'];
    const row = ['Example Product', 'SKU-123', 'Cement', '500', '100', 'High quality cement', 'false'];
    return [headers.join(','), row.join(',')].join('\n');
}
