import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class RadioCardOption {
  final String id;
  final String label;
  final String? description;
  final IconData? icon;
  final String? imageUrl;

  RadioCardOption({
    required this.id,
    required this.label,
    this.description,
    this.icon,
    this.imageUrl,
  });
}

class RadioCardGroup extends StatelessWidget {
  final List<RadioCardOption> options;
  final String? selectedId;
  final Function(String) onChanged;
  final int columns;

  const RadioCardGroup({
    super.key,
    required this.options,
    required this.selectedId,
    required this.onChanged,
    this.columns = 1,
  });

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
          mainAxisExtent: options.any((o) => o.imageUrl != null) ? 180 : 120,
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

  Widget _buildCard(RadioCardOption option) {
    final isSelected = selectedId == option.id;
    final primaryColor = const Color(0xFFC2410C);

    return GestureDetector(
      onTap: () => onChanged(option.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected ? primaryColor.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (option.imageUrl != null)
              Expanded(
                child: CachedNetworkImage(
                  imageUrl: option.imageUrl!,
                  fit: BoxFit.cover,
                  errorWidget: (_, __, ___) => Container(color: Colors.grey.shade100),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (option.icon != null) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor.withOpacity(0.1) : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        option.icon,
                        color: isSelected ? primaryColor : Colors.grey.shade600,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? primaryColor : Colors.grey.shade300,
                        width: isSelected ? 6 : 2,
                      ),
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
