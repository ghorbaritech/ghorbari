import 'dart:math';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:intl/intl.dart';
import 'package:Dalankotha_consumer/core/theme/Dalankotha_theme.dart';
import 'package:Dalankotha_consumer/features/tools/logic/calculation_logic.dart';

enum CalculatorMode { building, interior }

class CostCalculatorScreen extends StatefulWidget {
  const CostCalculatorScreen({super.key});

  @override
  State<CostCalculatorScreen> createState() => _CostCalculatorScreenState();
}

class _CostCalculatorScreenState extends State<CostCalculatorScreen> {
  CalculatorMode _mode = CalculatorMode.building;
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
    double total = 0;
    double perSqft = 0;
    Map<String, double> breakdown = {};
    Map<String, double> materials = {};
    Map<String, int> rates = {};

    if (_mode == CalculatorMode.building) {
      total = ConstructionCalculatorLogic.calculateTotal(
        _inputValue,
        _unit,
        _floors,
        _quality,
        _location,
        _foundation,
      );
      breakdown = ConstructionCalculatorLogic.getBreakdown(total);
      materials = ConstructionCalculatorLogic.getMaterialEstimation(
        _inputValue * ConstructionCalculatorLogic.unitMultiplier(_unit),
        _floors,
        _quality,
      );
      rates = ConstructionCalculatorLogic.getMaterialRates();
      perSqft = total / max(1, (_inputValue * ConstructionCalculatorLogic.unitMultiplier(_unit) * _floors));
    } else {
      total = InteriorCalculatorLogic.calculateTotal(
        _inputValue * (_unit == LandUnit.sqft ? 1.0 : ConstructionCalculatorLogic.unitMultiplier(_unit)),
        _quality,
        _location,
      );
      breakdown = InteriorCalculatorLogic.getBreakdown(total);
      materials = InteriorCalculatorLogic.getMaterialEstimation(
        _inputValue * (_unit == LandUnit.sqft ? 1.0 : ConstructionCalculatorLogic.unitMultiplier(_unit)),
        _quality,
      );
      rates = InteriorCalculatorLogic.getMaterialRates();
      perSqft = total / max(1, (_inputValue * (_unit == LandUnit.sqft ? 1.0 : ConstructionCalculatorLogic.unitMultiplier(_unit))));
    }

    return Scaffold(
      backgroundColor: DalankothaTheme.backgroundLite,
      appBar: AppBar(
        title: Text('nav_cost_calculator'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mode Toggle
            _buildModeToggle(),
            const SizedBox(height: 32),

            // Input Section
            _buildSectionTitle(_mode == CalculatorMode.building ? 'calc_land_size'.tr() : 'calc_area'.tr()),
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
                    Row(
                      children: [
                        Expanded(child: _buildLocationToggle()),
                        const SizedBox(width: 12),
                        if (_mode == CalculatorMode.building)
                          Expanded(child: _buildUnitToggle()),
                      ],
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _areaController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                      decoration: InputDecoration(
                        labelText: _mode == CalculatorMode.building ? 'calc_area'.tr() : 'lbl_sqft'.tr(),
                        suffixText: _mode == CalculatorMode.building ? _unit.name.toUpperCase() : 'SQFT',
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

            if (_mode == CalculatorMode.building) ...[
              const SizedBox(height: 32),
              _buildSectionTitle('calc_floors'.tr()),
              const SizedBox(height: 12),
              _buildFloorCounter(),
              const SizedBox(height: 32),
              _buildSectionTitle('calc_foundation'.tr()),
              const SizedBox(height: 12),
              _buildFoundationToggle(),
            ],

            const SizedBox(height: 32),
            _buildSectionTitle('calc_quality'.tr()),
            const SizedBox(height: 12),
            _buildQualitySelector(),

            const SizedBox(height: 40),
            
            // Results
            _buildResultsCard(total, perSqft, breakdown, materials, rates),
            
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildModeToggle() {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildModeTab(CalculatorMode.building, 'calc_mode_building'.tr(), Icons.domain_rounded),
          ),
          Expanded(
            child: _buildModeTab(CalculatorMode.interior, 'calc_mode_interior'.tr(), Icons.chair_rounded),
          ),
        ],
      ),
    );
  }

  Widget _buildModeTab(CalculatorMode mode, String label, IconData icon) {
    final isSelected = _mode == mode;
    return GestureDetector(
      onTap: () => setState(() => _mode = mode),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? DalankothaTheme.primaryBlue : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? Colors.white : Colors.grey, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade700,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                fontSize: 13,
              ),
            ),
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
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
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
          color: isSelected ? DalankothaTheme.primaryBlue.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? DalankothaTheme.primaryBlue : Colors.grey.shade100,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isSelected ? DalankothaTheme.primaryBlue : Colors.grey, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? DalankothaTheme.primaryBlue : Colors.grey.shade700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsCard(double total, double perSqft, Map<String, double> breakdown, Map<String, double> materials, Map<String, int> rates) {
    final currencyFormat = NumberFormat.currency(locale: context.locale.toString(), symbol: '৳ ', decimalDigits: 0);
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        color: DalankothaTheme.primaryDark,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'calc_total'.tr().toUpperCase(),
            style: TextStyle(
              color: Colors.white.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 8),
          FittedBox(
            child: Text(
              currencyFormat.format(total),
              style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${'calc_per_sqft'.tr()}: ${currencyFormat.format(perSqft)}',
            style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 32),
          
          if (_mode == CalculatorMode.building) ...[
            _buildBreakdownItem('calc_civil'.tr(), breakdown['civil']!, 0.42, Colors.blue,
              items: [
                '${'calc_mat_cement'.tr()}: ${materials['cement']?.round()} ${'unit_bags'.tr()} @ ৳${rates['cement']}',
                '${'calc_mat_steel'.tr()}: ${materials['steel']?.round()} ${'unit_kg'.tr()} @ ৳${rates['steel']}',
                '${'calc_mat_bricks'.tr()}: ${materials['bricks']?.round()} ${'unit_pcs'.tr()} @ ৳${rates['bricks']}',
                '${'calc_mat_sand'.tr()}: ${materials['sand']?.round()} ${'unit_cft'.tr()} @ ৳${rates['sand']}',
                '${'calc_mat_stone'.tr()}: ${materials['stone']?.round()} ${'unit_cft'.tr()} @ ৳${rates['stone']}',
              ],
            ),
            _buildBreakdownItem('calc_finishing'.tr(), breakdown['finishing']!, 0.33, Colors.green,
              items: [
                '${'calc_mat_tiles'.tr()}: ${materials['tiles']?.round()} ${'unit_sqft'.tr()} @ ৳${rates['tiles']}',
                '${'calc_mat_paint'.tr()}: ${materials['paint']?.round()} ${'unit_ltr'.tr()} @ ৳${rates['paint']}',
              ],
            ),
            _buildBreakdownItem('calc_mep'.tr(), breakdown['mep']!, 0.15, Colors.orange,
              items: [
                '${'calc_mat_fittings'.tr()}: ${materials['fittings']?.round()} ${'unit_points'.tr()} @ ৳${rates['fittings']}',
                '${'calc_mat_fixtures'.tr()}: ${materials['fixtures']?.round()} ${'unit_pcs'.tr()} @ ৳${rates['fixtures']}',
              ],
            ),
          ] else ...[
            _buildBreakdownItem('calc_woodwork'.tr(), breakdown['woodwork']!, 0.45, Colors.brown,
              items: [
                '${'calc_mat_board'.tr()}: ${materials['board']?.toStringAsFixed(1)} ${'unit_sheets'.tr()} @ ৳${rates['board']}',
              ],
            ),
            _buildBreakdownItem('calc_finishing'.tr(), breakdown['finishing']!, 0.25, Colors.green,
              items: [
                '${'calc_mat_tiles'.tr()}: ${materials['tiles']?.round()} ${'unit_sqft'.tr()} @ ৳${rates['tiles']}',
                '${'calc_mat_paint'.tr()}: ${materials['paint']?.round()} ${'unit_ltr'.tr()} @ ৳${rates['paint']}',
              ],
            ),
            _buildBreakdownItem('calc_ceiling'.tr(), breakdown['ceiling']!, 0.15, Colors.blue,
              items: [
                '${'calc_mat_ceiling'.tr()}: ${materials['ceiling_sqft']?.round()} ${'lbl_sqft'.tr()} @ ৳${rates['ceiling_sqft']}',
              ],
            ),
            _buildBreakdownItem('calc_lighting'.tr(), breakdown['lighting']!, 0.10, Colors.orange,
              items: [
                '${'calc_lighting'.tr()}: ${materials['lights']?.round()} ${'unit_pcs'.tr()} @ ৳${rates['lights']}',
              ],
            ),
          ],
          
          _buildBreakdownItem('calc_contingency'.tr(), breakdown['contingency']!, 0.10, Colors.grey),
          
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white, foregroundColor: DalankothaTheme.primaryDark,
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
              Text(currencyFormat.format(amount), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900)),
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
      decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(14)),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: options.map<Widget>((opt) {
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
                child: Text(opt.label,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                    color: isSelected ? DalankothaTheme.primaryDark : Colors.grey,
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
