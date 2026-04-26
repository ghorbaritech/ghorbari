import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/branding_service.dart';

class BrandingWidget extends StatefulWidget {
  final double size;
  final bool showText;
  final bool useInvertedLogo; // True for dark backgrounds
  
  const BrandingWidget({
    super.key, 
    this.size = 60, 
    this.showText = true,
    this.useInvertedLogo = false,
  });

  @override
  State<BrandingWidget> createState() => _BrandingWidgetState();
}

class _BrandingWidgetState extends State<BrandingWidget> {
  final _branding = BrandingService();

  @override
  Widget build(BuildContext context) {
    // Determine which dynamic URL to use
    final dynamicUrl = widget.useInvertedLogo 
        ? _branding.logoLightUrl 
        : _branding.logoDarkUrl;

    // Prioritize the local logo as requested by the user
    // This ensures the new branding is applied immediately across the app.
    const useLocalOnly = true; 

    final isBanner = widget.size > 100;
    
    return Container(
      width: isBanner ? double.infinity : null,
      padding: isBanner ? const EdgeInsets.all(24) : EdgeInsets.zero,
      decoration: isBanner ? BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ) : null,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          useLocalOnly 
              ? Image.asset(
                  'assets/images/dalankotha_logo_v3.png',
                  width: isBanner ? widget.size * 2 : widget.size,
                  height: isBanner ? widget.size : widget.size,
                  fit: BoxFit.contain,
                )
              : (dynamicUrl != null
                  ? CachedNetworkImage(
                      imageUrl: dynamicUrl,
                      width: widget.size,
                      height: widget.size,
                      fit: BoxFit.contain,
                      errorWidget: (context, url, error) => _buildFallback(),
                    )
                  : _buildFallback()),
          if (widget.showText) ...[
            SizedBox(height: isBanner ? 16 : 12),
            Text(
              'QUALITY CONSTRUCTION ECOSYSTEM',
              style: TextStyle(
                fontSize: isBanner ? 14 : widget.size * 0.15,
                fontWeight: FontWeight.bold,
                letterSpacing: 2.0,
                color: const Color(0xFF64748B),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFallback() {
    return Image.asset(
      'assets/images/dalankotha_logo_v3.png',
      width: widget.size,
      height: widget.size,
      fit: BoxFit.contain,
    );
  }
}
