import 'dart:math';

enum LandUnit { sqft, katha, decimal }
enum QualityTier { budget, standard, premium, luxury }
enum ProjectLocation { dhaka, outside }
enum FoundationType { shallow, deep }

class ConstructionCalculatorLogic {
  static const double baseRate = 2300.0; // Base BDT per sqft

  static double unitMultiplier(LandUnit unit) {
    switch (unit) {
      case LandUnit.sqft:
        return 1.0;
      case LandUnit.katha:
        return 720.0;
      case LandUnit.decimal:
        return 435.6;
    }
  }

  static double qualityMultiplier(QualityTier tier) {
    switch (tier) {
      case QualityTier.budget:
        return 0.85;
      case QualityTier.standard:
        return 1.0;
      case QualityTier.premium:
        return 1.3;
      case QualityTier.luxury:
        return 1.7;
    }
  }

  static double calculateTotal(
    double inputValue,
    LandUnit unit,
    int floors,
    QualityTier quality,
    ProjectLocation location,
    FoundationType foundation,
  ) {
    final areaSqft = inputValue * unitMultiplier(unit);
    final qMultiplier = qualityMultiplier(quality);
    final lMultiplier = location == ProjectLocation.dhaka ? 1.08 : 1.0;
    final floorMultiplier = floors > 5 ? 1 + (floors - 5) * 0.015 : 1.0;
    
    final constructionCostPerSqft = baseRate * qMultiplier * lMultiplier * floorMultiplier;
    final totalConstruction = areaSqft * floors * constructionCostPerSqft;
    
    final foundationCostPerSqft = foundation == FoundationType.deep ? 450.0 : 0.0;
    final totalFoundation = areaSqft * foundationCostPerSqft;
    
    return totalConstruction + totalFoundation;
  }

  static Map<String, double> getBreakdown(double total) {
    return {
      'civil': total * 0.42,
      'finishing': total * 0.33,
      'mep': total * 0.15,
      'contingency': total * 0.10,
    };
  }

  static Map<String, double> getMaterialEstimation(double areaSqft, int floors, QualityTier quality) {
    final totalArea = areaSqft * floors;
    final qualityMod = quality == QualityTier.luxury ? 1.05 : 1.0;
    
    return {
      'cement': totalArea * 0.45 * qualityMod,
      'steel': totalArea * 4.8 * (quality == QualityTier.luxury ? 1.1 : 1.0),
      'bricks': totalArea * 22,
      'sand': totalArea * 1.6,
      'stone': totalArea * 1.3,
      'tiles': totalArea * 1.15,
      'paint': totalArea * 0.15,
      'fittings': totalArea / 45,
      'fixtures': totalArea / 150,
    };
  }

  static Map<String, int> getMaterialRates() {
    return {
      'cement': 540,
      'steel': 93,
      'bricks': 14,
      'sand': 65,
      'stone': 230,
      'tiles': 150,
      'paint': 650,
      'fittings': 800,
      'fixtures': 4500,
    };
  }
}
