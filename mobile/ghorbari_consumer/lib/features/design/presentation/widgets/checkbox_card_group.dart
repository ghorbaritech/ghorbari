import 'package:flutter/material.dart';

class CheckboxCardOption {
  final String id;
  final String label;
  final String? description;
  final IconData? icon;

  CheckboxCardOption({
    required this.id,
    required this.label,
    this.description,
    this.icon,
  });
}

class CheckboxCardGroup extends StatelessWidget {
  final List<CheckboxCardOption> options;
  final List<String> selectedIds;
  final Function(List<String>) onChanged;
  final int columns;

  const CheckboxCardGroup({
    super.key,
    required this.options,
    required this.selectedIds,
    required this.onChanged,
    this.columns = 1,
  });

  void _toggleOption(String id) {
    final newSelected = List<String>.from(selectedIds);
    if (newSelected.contains(id)) {
      newSelected.remove(id);
    } else {
      newSelected.add(id);
    }
    onChanged(newSelected);
  }

  @override
  Widget build(BuildContext context) {
    if (columns > 1) {
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: columns,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          mainAxisExtent: 140,
        ),
        itemCount: options.length,
        itemBuilder: (context, index) {
          return _buildCard(options[index]);
        },
      );
    }

    return Column(
      children: options.map((option) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildCard(option),
        );
      }).toList(),
    );
  }

  Widget _buildCard(CheckboxCardOption option) {
    final isSelected = selectedIds.contains(option.id);
    final primaryColor = const Color(0xFFC2410C);

    return GestureDetector(
      onTap: () => _toggleOption(option.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                if (option.icon != null) ...[
                  Icon(
                    option.icon,
                    color: isSelected ? primaryColor : Colors.grey.shade600,
                    size: 28,
                  ),
                  const Spacer(),
                ],
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isSelected ? primaryColor : Colors.grey.shade300,
                      width: 2,
                    ),
                    color: isSelected ? primaryColor : Colors.white,
                  ),
                  child: isSelected
                      ? const Icon(Icons.check, color: Colors.white, size: 16)
                      : null,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              option.label,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: isSelected ? primaryColor : const Color(0xFF0F172A),
              ),
            ),
            if (option.description != null) ...[
              const SizedBox(height: 4),
              Text(
                option.description!,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
