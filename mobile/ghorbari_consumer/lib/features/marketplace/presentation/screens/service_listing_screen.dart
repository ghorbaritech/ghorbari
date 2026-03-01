import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_bloc.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/bloc/marketplace_state.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/widgets/product_card.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/product_details_screen.dart';
import 'package:ghorbari_consumer/shared/models/cms_content.dart';

class ServiceListingScreen extends StatelessWidget {
  final CMSProductSection section;

  const ServiceListingScreen({super.key, required this.section});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(section.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: BlocBuilder<MarketplaceBloc, MarketplaceState>(
        builder: (context, state) {
          // In a real app, we'd fetch services specifically. 
          // For now, we'll show the filtered products (services) that match the section/category.
          
          final categoryId = section.categoryId;
          final services = state.products.where((p) {
             if (p.categoryId == categoryId) return true;
             // Semantic matching as in HomeScreen
             return p.name.toLowerCase().contains(section.title.toLowerCase().split(' ').first);
          }).toList();

          if (services.isEmpty) {
             // Fallback to our dummy services if nothing found
             return const Center(child: Text('Coming soon: Browse all services.'));
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.7,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: services.length,
            itemBuilder: (context, index) {
              return ProductCard(
                product: services[index],
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProductDetailsScreen(product: services[index]),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
