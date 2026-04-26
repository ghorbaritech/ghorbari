import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_event.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/bloc/auth_state.dart';
import 'package:Dalankotha_consumer/features/auth/presentation/screens/login_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/home_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/product_explore_screen.dart';
import 'package:Dalankotha_consumer/features/services/presentation/screens/service_explore_screen.dart';
import 'package:Dalankotha_consumer/features/design/presentation/screens/design_studio_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/orders_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/profile_screen.dart';
import 'package:Dalankotha_consumer/features/marketplace/presentation/screens/messages_screen.dart';
import 'package:Dalankotha_consumer/features/tools/presentation/screens/cost_calculator_screen.dart';
import 'package:Dalankotha_consumer/features/assistant/presentation/screens/ai_consultant_screen.dart';

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
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return BlocBuilder<AuthBloc, AuthState>(
          builder: (context, authState) {
            final isLoggedIn = authState is AuthAuthenticated;
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Drag handle
                    Center(
                      child: Container(
                        width: 40, height: 4,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

                    // User greeting or guest header
                    if (isLoggedIn && authState is AuthAuthenticated)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 20.0),
                        child: Row(
                          children: [
                            Container(
                              width: 44, height: 44,
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.person_rounded, color: Color(0xFF2563EB), size: 22),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'welcome'.tr(),
                                  style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                                ),
                                Text(
                                  authState.user.fullName ?? 'User',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.only(bottom: 20.0),
                        child: Text(
                          'menu'.tr(),
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ),

                    // AI Consultant CTA (primary featured item)
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF059669)]),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                        leading: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 22),
                        title: const Text('AI Consultant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 0.3)),
                        subtitle: const Text('Design, cost & renovation help', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        trailing: const Icon(Icons.arrow_forward_rounded, color: Colors.white70, size: 18),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const AIConsultantScreen()),
                          );
                        },
                      ),
                    ),

                    // Section: Account
                    _buildMenuSection('ACCOUNT'),
                    if (isLoggedIn)
                      _buildMenuItem(
                        icon: Icons.person_outline,
                        iconColor: const Color(0xFF2563EB),
                        label: 'profile'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfileScreen()));
                        },
                      )
                    else
                      _buildMenuItem(
                        icon: Icons.login_rounded,
                        iconColor: const Color(0xFF2563EB),
                        label: 'login'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
                        },
                      ),
                    if (isLoggedIn) ...[  
                      _buildMenuItem(
                        icon: Icons.message_outlined,
                        iconColor: const Color(0xFF0EA5E9),
                        label: 'messages'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const MessagesScreen()));
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.shopping_bag_outlined,
                        iconColor: const Color(0xFF059669),
                        label: 'orders'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const OrdersScreen()));
                        },
                      ),
                      _buildMenuItem(
                        icon: Icons.event_note_outlined,
                        iconColor: const Color(0xFF7C3AED),
                        label: 'my_bookings'.tr(),
                        onTap: () => Navigator.pop(context),
                      ),
                    ],

                    const Divider(height: 24, thickness: 1),
                    _buildMenuSection('TOOLS'),
                    _buildMenuItem(
                      icon: Icons.calculate_outlined,
                      iconColor: const Color(0xFFF59E0B),
                      label: 'nav_cost_calculator'.tr(),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const CostCalculatorScreen()));
                      },
                    ),

                    const Divider(height: 24, thickness: 1),
                    _buildMenuSection('PREFERENCES'),
                    // Language toggle
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.language_rounded, color: Color(0xFF6366F1), size: 20),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text('language'.tr(),
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                            ),
                          ),
                          DropdownButton<Locale>(
                            value: context.locale,
                            underline: const SizedBox(),
                            borderRadius: BorderRadius.circular(12),
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
                        ],
                      ),
                    ),
                    _buildMenuItem(
                      icon: Icons.settings_outlined,
                      iconColor: Colors.grey,
                      label: 'settings'.tr(),
                      onTap: () => Navigator.pop(context),
                    ),

                    if (isLoggedIn) ...[
                      const Divider(height: 24, thickness: 1),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.logout_rounded, color: Colors.red.shade600, size: 20),
                        ),
                        title: Text('logout'.tr(),
                          style: TextStyle(color: Colors.red.shade600, fontWeight: FontWeight.w700, fontSize: 15),
                        ),
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

  // Helper: Build a branded menu section label
  Widget _buildMenuSection(String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 4, 0, 8),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: Colors.grey,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  // Helper: Build a branded menu item row
  Widget _buildMenuItem({required IconData icon, required Color iconColor, required String label, required VoidCallback onTap}) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: Color(0xFF0F172A),
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 18),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, authState) {
            final isLoggedIn = authState is AuthAuthenticated;
            return SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    if (isLoggedIn && authState is AuthAuthenticated)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 24),
                        child: Row(
                          children: [
                            Container(
                              width: 50, height: 50,
                              decoration: BoxDecoration(
                                color: const Color(0xFF2563EB).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(Icons.person_rounded, color: Color(0xFF2563EB), size: 26),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'welcome'.tr(),
                                    style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                                  ),
                                  Text(
                                    authState.user.fullName ?? 'User',
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.only(bottom: 24.0),
                        child: Text(
                          'menu'.tr(),
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                      ),

                    // AI Consultant CTA
                    Container(
                      width: double.infinity,
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF14B8A6), Color(0xFF059669)]),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: ListTile(
                        leading: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 24),
                        title: const Text('AI Consultant', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                        subtitle: const Text('Design, cost & renovation help', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        trailing: const Icon(Icons.arrow_forward_rounded, color: Colors.white70, size: 20),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const AIConsultantScreen()));
                        },
                      ),
                    ),

                    _buildMenuSection('ACCOUNT'),
                    if (isLoggedIn)
                      _buildMenuItem(
                        icon: Icons.person_outline,
                        iconColor: const Color(0xFF2563EB),
                        label: 'profile'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfileScreen()));
                        },
                      )
                    else
                      _buildMenuItem(
                        icon: Icons.login_rounded,
                        iconColor: const Color(0xFF2563EB),
                        label: 'login'.tr(),
                        onTap: () {
                          Navigator.pop(context);
                          Navigator.push(context, MaterialPageRoute(builder: (context) => const LoginScreen()));
                        },
                      ),
                      
                    _buildMenuItem(
                      icon: Icons.message_outlined,
                      iconColor: const Color(0xFF0EA5E9),
                      label: 'messages'.tr(),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const MessagesScreen()));
                      },
                    ),
                    _buildMenuItem(
                      icon: Icons.shopping_bag_outlined,
                      iconColor: const Color(0xFF059669),
                      label: 'orders'.tr(),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const OrdersScreen()));
                      },
                    ),

                    const Divider(height: 32, thickness: 1),
                    _buildMenuSection('TOOLS'),
                    _buildMenuItem(
                      icon: Icons.calculate_outlined,
                      iconColor: const Color(0xFFF59E0B),
                      label: 'nav_cost_calculator'.tr(),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (context) => const CostCalculatorScreen()));
                      },
                    ),

                    const Divider(height: 32, thickness: 1),
                    _buildMenuSection('PREFERENCES'),
                    // Language toggle inside drawer
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xFF6366F1).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.language_rounded, color: Color(0xFF6366F1), size: 22),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text('language'.tr(),
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                            ),
                          ),
                          DropdownButton<Locale>(
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
                        ],
                      ),
                    ),
                    
                    if (isLoggedIn)
                      Padding(
                        padding: const EdgeInsets.only(top: 24),
                        child: ElevatedButton.icon(
                          onPressed: () {
                            context.read<AuthBloc>().add(AuthLogoutRequested());
                            Navigator.pop(context);
                          },
                          icon: const Icon(Icons.logout_rounded, size: 18),
                          label: const Text('Logout'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade50,
                            foregroundColor: Colors.red,
                            elevation: 0,
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
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
