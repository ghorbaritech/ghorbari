import 'package:ghorbari_consumer/core/network/supabase_service.dart';
import 'package:ghorbari_consumer/shared/models/service_item.dart';

abstract class ServiceRemoteDataSource {
  Future<List<ServiceItem>> getServices({String? categoryId});
  Future<List<ServiceItem>> getDesignPackages();
  Future<ServiceItem> getServiceDetails(String serviceId);
}

class ServiceRemoteDataSourceImpl implements ServiceRemoteDataSource {
  @override
  Future<List<ServiceItem>> getServices({String? categoryId}) async {
    // Service items are actually stored as level-2 product_categories with type 'service'
    var query = SupabaseService.from('product_categories')
        .select('id, name, name_bn, type, level, metadata, icon, icon_url, parent_id, parent:parent_id(id, name, name_bn)')
        .eq('type', 'service');
    
    if (categoryId != null) {
      query = query.eq('parent_id', categoryId);
    }
    
    final response = await query.order('name');
    final List<dynamic> catData = response;
    
    return catData.map((cat) {
      final price = (cat['metadata']?['price'] ?? 0).toDouble();
      final unit = cat['metadata']?['unit'] ?? 'hr';
      final icon = cat['icon_url'] ?? cat['icon'];
      
      return ServiceItem(
        id: cat['id'],
        name: cat['name'],
        description: cat['name_bn'],
        unitPrice: price,
        unitType: unit,
        imageUrl: icon ?? '',
        categoryId: cat['parent_id'] ?? '',
        providerId: 'ghorbari',
        rating: 4.8,
      );
    }).toList();
  }

  @override
  Future<List<ServiceItem>> getDesignPackages() async {
    // Design packages are service items where category type is 'design' 
    // or specifically tagged. For now, we'll fetch from a known design category group.
    final response = await SupabaseService.from('service_items')
        .select('*, category:product_categories!inner(*)')
        .eq('category.type', 'design')
        .order('name');
    
    return (response as List).map((json) => ServiceItem.fromJson(json)).toList();
  }

  @override
  Future<ServiceItem> getServiceDetails(String serviceId) async {
    final response = await SupabaseService.from('service_items')
        .select()
        .eq('id', serviceId)
        .single();
    
    return ServiceItem.fromJson(response);
  }
}
