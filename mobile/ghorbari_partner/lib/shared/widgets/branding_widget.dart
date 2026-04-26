import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/branding_service.dart';

class BrandingWidget extends StatefulWidget {
  final double size;
  final bool showText;
  final bool useInvertedLogo; // Defaults to true for Partner App (Dark Backgrounds)
  
  const BrandingWidget({
    super.key, 
    this.size = 60, 
    this.showText = true,
    this.useInvertedLogo = true, 
  });

  @override
  State<BrandingWidget> createState() => _BrandingWidgetState();
}

class _BrandingWidgetState extends State<BrandingWidget> {
  final _branding = BrandingService();

  @override
  Widget build(BuildContext context) {
    final dynamicUrl = widget.useInvertedLogo 
        ? _branding.logoLightUrl 
        : _branding.logoDarkUrl;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        dynamicUrl != null
            ? CachedNetworkImage(
                imageUrl: dynamicUrl,
                width: widget.size,
                height: widget.size,
                fit: BoxFit.contain,
                placeholder: (context, url) => SizedBox(
                  width: widget.size,
                  height: widget.size,
                  padding: const EdgeInsets.all(8.0),
                  child: const CircularProgressIndicator(strokeWidth: 2),
                ),
                errorWidget: (context, url, error) => _buildFallback(),
              )
            : _buildFallback(),
        if (widget.showText) ...[
          const SizedBox(height: 12),
          Text(
            'ENGINEERING EXCELLENCE',
            style: TextStyle(
              fontSize: widget.size * 0.15,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
              color: Colors.grey.shade400,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildFallback() {
    return Image.asset(
      'assets/images/logo.png',
      width: widget.size,
      height: widget.size,
      fit: BoxFit.contain,
      color: widget.useInvertedLogo ? Colors.white : null,
    );
  }
}
