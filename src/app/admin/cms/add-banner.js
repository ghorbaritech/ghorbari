const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'api', 'cms', 'content', 'data.json');
try {
    const content = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.page_layout) {
        data.page_layout = [];
    }

    // Add section
    const sectionId = 'single_banner_' + Date.now();
    data.page_layout.push({
        id: sectionId,
        type: 'SingleSlider',
        title: 'Brand Banner',
        data_key: sectionId,
        hidden: false
    });

    // Add content
    data[sectionId] = {
        title: 'Brand Banner',
        items: [
            {
                id: Date.now(),
                image: 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924976/Frame_1618868661_2_w1oab5.png', // Fallback, we will use the user's base64/url if provided next
                link: '/'
            }
        ]
    };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Successfully injected single banner.');
} catch (e) {
    console.error(e);
}
