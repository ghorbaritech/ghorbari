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
    var query = SupabaseService.from('service_items').select();
    
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    final response = await query.order('name');
    return (response as List).map((json) => ServiceItem.fromJson(json)).toList();
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
