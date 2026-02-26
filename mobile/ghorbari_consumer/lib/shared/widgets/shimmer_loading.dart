import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoading extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius borderRadius;

  const ShimmerLoading({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = const BorderRadius.all(Radius.circular(12)),
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.withOpacity(0.1),
      highlightColor: Colors.grey.withOpacity(0.05),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius,
        ),
      ),
    );
  }

  static Widget productCardPlaceholder() {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ShimmerLoading(width: 160, height: 160, borderRadius: BorderRadius.all(Radius.circular(20))),
          const SizedBox(height: 12),
          const ShimmerLoading(width: 100, height: 14),
          const SizedBox(height: 8),
          const ShimmerLoading(width: 60, height: 12),
        ],
      ),
    );
  }

  static Widget serviceCardPlaceholder() {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ShimmerLoading(width: 280, height: 180, borderRadius: BorderRadius.all(Radius.circular(20))),
          const SizedBox(height: 16),
          const ShimmerLoading(width: 180, height: 18),
          const SizedBox(height: 8),
          const ShimmerLoading(width: 240, height: 14),
        ],
      ),
    );
  }
}
