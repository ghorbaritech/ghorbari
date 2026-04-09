import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_event.dart';
import 'package:ghorbari_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:ghorbari_consumer/features/auth/presentation/screens/login_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/home_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/product_explore_screen.dart';
import 'package:ghorbari_consumer/features/services/presentation/screens/service_explore_screen.dart';
import 'package:ghorbari_consumer/features/design/presentation/screens/design_studio_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/orders_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/profile_screen.dart';
import 'package:ghorbari_consumer/features/marketplace/presentation/screens/messages_screen.dart';
import 'package:ghorbari_consumer/features/tools/presentation/screens/cost_calculator_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  // The pages for our IndexedStack
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      HomeScreen(onNavigateToTab: _onItemTapped),
      const DesignStudioScreen(),
      const ServiceExploreScreen(),
      const ProductExploreScreen(),
    ];
  }

  void _onItemTapped(int index) {
    if (index == 4) {
      // Menu tapped - open drawer or show modal
      _showMenuSheet(context);
    } else {
      setState(() {
        _currentIndex = index;
      });
    }
  }

  void _showMenuSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return BlocBuilder<AuthBloc, AuthState>(
          builder: (context, authState) {
            final isLoggedIn = authState is AuthAuthenticated;
            return Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isLoggedIn && authState is AuthAuthenticated)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Column(
                          children: [
                            Text(
                              'welcome'.tr(),
                              style: const TextStyle(fontSize: 14, color: Colors.grey),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              authState.user.fullName ?? 'User',
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Text(
                          'menu'.tr(),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                    if (isLoggedIn)
                      ListTile(
                        leading: const Icon(Icons.person_outline),
                        title: Text('profile'.tr()),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const ProfileScreen()),
                          );
                        },
                      )
                    else
                      ListTile(
                        leading: const Icon(Icons.login),
                        title: Text('login'.tr()),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const LoginScreen()),
                          );
                        },
                      ),
                    ListTile(
                      leading: const Icon(Icons.message_outlined),
                      title: Text('messages'.tr()),
                      onTap: () {
                          Navigator.pop(context);
                          if (!isLoggedIn) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('please_login_messages'.tr())));
                          } else {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const MessagesScreen()),
                              );
                          }
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.shopping_bag_outlined),
                      title: Text('orders'.tr()),
                      onTap: () {
                          Navigator.pop(context);
                          if (!isLoggedIn) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('please_login_orders'.tr())));
                          } else {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const OrdersScreen()),
                              );
                          }
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.calculate_outlined),
                      title: Text('nav_cost_calculator'.tr()),
                      onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const CostCalculatorScreen()),
                          );
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.event_note_outlined),
                      title: Text('my_bookings'.tr()),
                      onTap: () {
                          Navigator.pop(context);
                          if (!isLoggedIn) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('please_login_bookings'.tr())));
                          }
                      },
                    ),
                    ListTile(
                      leading: const Icon(Icons.language),
                      title: Text('language'.tr()),
                      trailing: DropdownButton<Locale>(
                        value: context.locale,
                        underline: const SizedBox(),
                        items: const [
                          DropdownMenuItem(value: Locale('en'), child: Text('English')),
                          DropdownMenuItem(value: Locale('bn'), child: Text('বাংলা')),
                        ],
                        onChanged: (Locale? newLocale) {
                          if (newLocale != null) {
                            context.setLocale(newLocale);
                            Navigator.pop(context);
                          }
                        },
                      ),
                    ),
                    ListTile(
                      leading: const Icon(Icons.settings_outlined),
                      title: Text('settings'.tr()),
                      onTap: () => Navigator.pop(context),
                    ),
                    if (isLoggedIn) ...[
                      const Divider(),
                      ListTile(
                        leading: const Icon(Icons.logout, color: Colors.red),
                        title: Text('logout'.tr(), style: const TextStyle(color: Colors.red)),
                        onTap: () {
                          Navigator.pop(context);
                          context.read<AuthBloc>().add(AuthLogoutRequested());
                        },
                      ),
                    ]
                  ],
                ),
              ),
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onItemTapped,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF2563EB), // Primary color
          unselectedItemColor: Colors.grey.shade500,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          iconSize: 24,
          elevation: 0,
          items: [
            BottomNavigationBarItem(
              icon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.home_outlined),
              ),
              activeIcon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.home_rounded),
              ),
              label: 'home'.tr(),
            ),
            BottomNavigationBarItem(
              icon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.architecture_outlined),
              ),
              activeIcon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.architecture),
              ),
              label: 'design'.tr(),
            ),
            BottomNavigationBarItem(
              icon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.handyman_outlined),
              ),
              activeIcon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.handyman),
              ),
              label: 'services'.tr(),
            ),
            BottomNavigationBarItem(
              icon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.inventory_2_outlined),
              ),
              activeIcon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.inventory_2),
              ),
              label: 'product'.tr(),
            ),
            BottomNavigationBarItem(
              icon: const Padding(
                padding: EdgeInsets.only(bottom: 4),
                child: Icon(Icons.menu_rounded),
              ),
              label: 'menu'.tr(),
            ),
          ],
        ),
      ),
    );
  }
}
