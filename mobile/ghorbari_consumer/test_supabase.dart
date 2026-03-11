import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse('https://nnrzszujwhutbgghtjwc.supabase.co/rest/v1/product_categories?type=eq.design&level=eq.0');
  final key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucnpzenVqd2h1dGJnZ2h0andjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTM0MDYsImV4cCI6MjA4NDcyOTQwNn0.Wm5Rt80-9_WyDCIxQVbreNSn9BTlqfgN8HmORGZcsO4';
  
  final response = await http.get(url, headers: {
    'apikey': key,
    'Authorization': 'Bearer $key',
  });
  
  if (response.statusCode == 200) {
    print('Fetched ${jsonDecode(response.body).length} categories');
    final List data = jsonDecode(response.body);
    for (var cat in data) {
      print('---');
      print('ID: ${cat['id']}');
      print('Name: ${cat['name']}');
      print('NameBn: ${cat['name_bn']}');
      print('Level: ${cat['level']}');
    }
  } else {
    print('Error: ${response.statusCode} ${response.body}');
  }
}
