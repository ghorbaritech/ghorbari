import 'package:flutter/material.dart';
import 'package:Dalankotha_consumer/shared/models/service_item.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:Dalankotha_consumer/shared/widgets/glass_card.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:Dalankotha_consumer/features/cart/presentation/bloc/cart_event.dart';
import 'package:Dalankotha_consumer/features/bookings/presentation/screens/booking_screen.dart';
import 'package:Dalankotha_consumer/features/design/presentation/screens/design_booking_wizard_screen.dart';
import 'package:Dalankotha_consumer/core/utils/logger.dart';

class ServiceCard extends StatelessWidget {
  final ServiceItem service;
  final VoidCallback onTap;

  const ServiceCard({
    super.key,
    required this.service,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (service.imageUrl != null && service.imageUrl!.isNotEmpty) {
       AppLogger.i('SERVICE CARD [${service.name}] IMAGE URL: ${service.imageUrl}');
    } else {
       AppLogger.d('SERVICE CARD [${service.name}] HAS NO IMAGE URL!');
    }
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 16),
      child: InkWell(
        onTap: onTap,
        child: GlassCard(
          padding: EdgeInsets.zero,
          opacity: 0.03,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Hero(
                        tag: 'service_${service.id}',
                        child: service.imageUrl != null && service.imageUrl!.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: service.imageUrl!,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  color: Colors.grey.shade100,
                                ),
                                errorWidget: (context, url, error) => Container(
                                  color: Colors.grey.shade100,
                                  child: const Icon(Icons.handyman_outlined, color: Colors.grey),
                                ),
                              )
                            : Container(color: Colors.grey.shade100, child: const Icon(Icons.handyman_outlined)),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.star, color: Colors.orange, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              service.rating.toString(),
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (context.locale.languageCode == 'bn' && service.description != null && service.description!.isNotEmpty)
                          ? service.description!
                          : service.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'from'.tr().toUpperCase(),
                              style: TextStyle(fontSize: 7, fontWeight: FontWeight.bold, color: Colors.grey.shade400, letterSpacing: 0.5),
                            ),
                            Text(
                              '৳${service.unitPrice.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                         ElevatedButton(
                          onPressed: () {
                            // Route design services to the dedicated design wizard
                            if (service.categoryId == 'design') {
                              final name = service.name.toLowerCase();
                              final isStructural = name.contains('structur') || name.contains('architectur') || name.contains('build') || name.contains('plan');
                              Navigator.push(context, MaterialPageRoute(
                                builder: (context) => DesignBookingWizardScreen(
                                  initialService: isStructural ? 'structural-architectural' : 'interior',
                                ),
                              ));
                            } else {
                              Navigator.push(context, MaterialPageRoute(builder: (context) => BookingScreen(service: service)));
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                            minimumSize: const Size(0, 32),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                          child: Text(
                            'book'.tr(),
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
