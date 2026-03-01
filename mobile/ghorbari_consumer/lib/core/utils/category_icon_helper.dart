
class CategoryIconHelper {
  static String getIcon(String categoryName) {
    final name = categoryName.toLowerCase();
    
    if (name.contains('cement')) return '🧱';
    if (name.contains('sand')) return '⏳';
    if (name.contains('brick')) return '🧱';
    if (name.contains('stone')) return '🪨';
    if (name.contains('pipe')) return '🚰';
    if (name.contains('steel')) return '🏗️';
    if (name.contains('iron')) return '🏗️';
    if (name.contains('glass')) return '🪟';
    if (name.contains('grill')) return '🛡️';
    if (name.contains('tile')) return '⬜';
    if (name.contains('paint')) return '🎨';
    if (name.contains('electric')) return '⚡';
    if (name.contains('door')) return '🚪';
    if (name.contains('window')) return '🪟';
    if (name.contains('sanitary')) return '🚽';
    if (name.contains('hardware')) return '🛠️';
    if (name.contains('interior')) return '🛋️';
    if (name.contains('architect')) return '📐';
    if (name.contains('structural')) return '🏗️';
    if (name.contains('civil')) return '👷';
    if (name.contains('mechanical')) return '⚙️';
    if (name.contains('landscape')) return '🌳';
    if (name.contains('automation')) return '🤖';
    if (name.contains('solar')) return '☀️';
    if (name.contains('roof')) return '🏠';
    if (name.contains('soil')) return '🌱';
    
    // Default icons based on common categories seen in logs
    if (name.contains('material')) return '🏗️';
    if (name.contains('service')) return '🛠️';
    if (name.contains('design')) return '🎨';

    return '📦'; // Default package icon
  }
}
