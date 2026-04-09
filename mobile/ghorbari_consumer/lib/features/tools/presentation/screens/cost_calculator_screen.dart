import 'dart:math';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import 'package:ghorbari_consumer/core/theme/ghorbari_theme.dart';
import 'package:ghorbari_consumer/features/tools/logic/calculation_logic.dart';

class CostCalculatorScreen extends StatefulWidget {
  const CostCalculatorScreen({super.key});

  @override
  State<CostCalculatorScreen> createState() => _CostCalculatorScreenState();
}

class _CostCalculatorScreenState extends State<CostCalculatorScreen> {
  double _inputValue = 1200.0;
  LandUnit _unit = LandUnit.sqft;
  int _floors = 1;
  QualityTier _quality = QualityTier.standard;
  ProjectLocation _location = ProjectLocation.dhaka;
  FoundationType _foundation = FoundationType.shallow;

  final TextEditingController _areaController = TextEditingController(text: '1200');

  @override
  void dispose() {
    _areaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final total = ConstructionCalculatorLogic.calculateTotal(
      _inputValue,
      _unit,
      _floors,
      _quality,
      _location,
      _foundation,
    );
    final breakdown = ConstructionCalculatorLogic.getBreakdown(total);
    final materials = ConstructionCalculatorLogic.getMaterialEstimation(
      _inputValue * ConstructionCalculatorLogic.unitMultiplier(_unit),
      _floors,
      _quality,
    );
    final perSqft = total / (_inputValue * ConstructionCalculatorLogic.unitMultiplier(_unit) * _floors);

    return Scaffold(
      backgroundColor: GhorbariTheme.backgroundLite,
      appBar: AppBar(
        title: Text('calc_title'.tr()),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Project Details Card
            _buildSectionTitle('calc_land_size'.tr()),
            const SizedBox(height: 12),
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: Colors.grey.shade100),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    // Location & Unit Toggles
                    Row(
                      children: [
                        Expanded(child: _buildLocationToggle()),
                        const SizedBox(width: 12),
                        Expanded(child: _buildUnitToggle()),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Land Size Input
                    TextField(
                      controller: _areaController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.black),
                      decoration: InputDecoration(
                        labelText: 'calc_area'.tr(),
                        suffixText: _unit.name.toUpperCase(),
                        prefixIcon: const Icon(Icons.square_foot),
                      ),
                      onChanged: (val) {
                        setState(() {
                          _inputValue = double.tryParse(val) ?? 0.0;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),
            _buildSectionTitle('calc_floors'.tr()),
            const SizedBox(height: 12),
            _buildFloorCounter(),

            const SizedBox(height: 32),
            _buildSectionTitle('calc_foundation'.tr()),
            const SizedBox(height: 12),
            _buildFoundationToggle(),

            const SizedBox(height: 32),
            _buildSectionTitle('calc_quality'.tr()),
            const SizedBox(height: 12),
            _buildQualitySelector(),

            const SizedBox(height: 40),
            
            // Results Display
            _buildResultsCard(total, perSqft, breakdown, materials),
            
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title.toUpperCase(),
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.5,
        color: Colors.grey,
      ),
    );
  }

  Widget _buildLocationToggle() {
    return _buildSegmentedToggle<ProjectLocation>(
      value: _location,
      options: [
        ToggleOption(ProjectLocation.dhaka, 'opt_dhaka'.tr()),
        ToggleOption(ProjectLocation.outside, 'opt_outside_dhaka'.tr()),
      ],
      onChanged: (val) => setState(() => _location = val),
    );
  }

  Widget _buildUnitToggle() {
    return _buildSegmentedToggle<LandUnit>(
      value: _unit,
      options: [
        ToggleOption(LandUnit.sqft, 'lbl_sqft'.tr()),
        ToggleOption(LandUnit.katha, 'lbl_katha'.tr()),
        ToggleOption(LandUnit.decimal, 'lbl_decimal'.tr()),
      ],
      onChanged: (val) => setState(() => _unit = val),
    );
  }

  Widget _buildFoundationToggle() {
    return _buildSegmentedToggle<FoundationType>(
      value: _foundation,
      options: [
        ToggleOption(FoundationType.shallow, 'opt_shallow'.tr()),
        ToggleOption(FoundationType.deep, 'opt_deep'.tr()),
      ],
      onChanged: (val) => setState(() => _foundation = val),
    );
  }

  Widget _buildFloorCounter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton.filledTonal(
            onPressed: () => setState(() => _floors = max(1, _floors - 1)),
            icon: const Icon(Icons.remove),
          ),
          Text(
            '$_floors',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.black),
          ),
          IconButton.filledTonal(
            onPressed: () => setState(() => _floors = min(20, _floors + 1)),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }

  Widget _buildQualitySelector() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 2.2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildQualityCard(QualityTier.budget, 'calc_budget'.tr(), Icons.bolt),
        _buildQualityCard(QualityTier.standard, 'calc_standard'.tr(), Icons.home),
        _buildQualityCard(QualityTier.premium, 'calc_premium'.tr(), Icons.diamond),
        _buildQualityCard(QualityTier.luxury, 'calc_luxury'.tr(), Icons.shield),
      ],
    );
  }

  Widget _buildQualityCard(QualityTier tier, String label, IconData icon) {
    final isSelected = _quality == tier;
    return GestureDetector(
      onTap: () => setState(() => _quality = tier),
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? GhorbariTheme.primaryBlue.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? GhorbariTheme.primaryBlue : Colors.grey.shade100,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? GhorbariTheme.primaryBlue : Colors.grey, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? GhorbariTheme.primaryBlue : Colors.grey.shade700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsCard(double total, double perSqft, Map<String, double> breakdown, Map<String, double> materials) {
    final currencyFormat = NumberFormat.currency(locale: context.locale.toString(), symbol: '৳ ', decimalDigits: 0);
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        color: GhorbariTheme.primaryDark,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'calc_total'.tr().toUpperCase(),
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          FittedBox(
            child: Text(
              currencyFormat.format(total),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.w900,
                letterSpacing: -1,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${'calc_per_sqft'.tr()}: ${currencyFormat.format(perSqft)}',
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 32),
          _buildBreakdownItem(
            'calc_civil'.tr(), 
            breakdown['civil']!, 
            0.42, 
            Colors.blue,
            items: [
              '${'calc_mat_cement'.tr()}: ${materials['cement']!.round()} ${'unit_bags'.tr()}',
              '${'calc_mat_steel'.tr()}: ${materials['steel']!.round()} ${'unit_kg'.tr()}',
              '${'calc_mat_bricks'.tr()}: ${materials['bricks']!.round()} ${'unit_pcs'.tr()}',
            ],
          ),
          _buildBreakdownItem(
            'calc_finishing'.tr(), 
            breakdown['finishing']!, 
            0.33, 
            Colors.emerald,
            items: [
              '${'calc_mat_tiles'.tr()}: ${materials['tiles']!.round()} ${'unit_sqft'.tr()}',
              '${'calc_mat_paint'.tr()}: ${materials['paint']!.round()} ${'unit_ltr'.tr()}',
            ],
          ),
          _buildBreakdownItem(
            'calc_mep'.tr(), 
            breakdown['mep']!, 
            0.15, 
            Colors.orange,
            items: [
              '${'calc_mat_fittings'.tr()}: ${materials['fittings']!.round()} ${'unit_points'.tr()}',
              '${'calc_mat_fixtures'.tr()}: ${materials['fixtures']!.round()} ${'unit_pcs'.tr()}',
            ],
          ),
          _buildBreakdownItem(
            'calc_contingency'.tr(), 
            breakdown['contingency']!, 
            0.10, 
            Colors.grey,
          ),
          
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: GhorbariTheme.primaryDark,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: Text('calc_book_consultation'.tr().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownItem(String label, double amount, double percent, Color color, {List<String>? items}) {
    final currencyFormat = NumberFormat.currency(locale: context.locale.toString(), symbol: '৳ ', decimalDigits: 0);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
              Text(currencyFormat.format(amount), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.black)),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: percent,
            backgroundColor: Colors.white.withOpacity(0.1),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            borderRadius: BorderRadius.circular(4),
            minHeight: 4,
          ),
          if (items != null) ...[
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: items.map((item) => Text(
                item,
                style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 9, fontWeight: FontWeight.w500),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSegmentedToggle<T>({
    required T value,
    required List<ToggleOption<T>> options,
    required ValueChanged<T> onChanged,
  }) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: options.map((opt) {
          final isSelected = opt.value == value;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(opt.value),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isSelected ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))] : null,
                ),
                child: Text(
                  opt.label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                    color: isSelected ? GhorbariTheme.primaryDark : Colors.grey,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class ToggleOption<T> {
  final T value;
  final String label;
  ToggleOption(this.value, this.label);
}
