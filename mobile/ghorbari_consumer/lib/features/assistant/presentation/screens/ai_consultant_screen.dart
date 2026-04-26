import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:Dalankotha_consumer/core/theme/Dalankotha_theme.dart';

class AIConsultantScreen extends StatefulWidget {
  const AIConsultantScreen({super.key});

  @override
  State<AIConsultantScreen> createState() => _AIConsultantScreenState();
}

class _AIConsultantScreenState extends State<AIConsultantScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'content': 'Assalamu Alaikum! I am your Dalankotha AI Consultant. I can help you with architecture, interior design, construction costs, and material selection. How can I assist you today?',
      'time': DateTime.now(),
    }
  ];

  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();
  final Dio _dio = Dio();
  final ImagePicker _picker = ImagePicker();

  bool _isListening = false;
  bool _isTyping = false;
  File? _attachedImage;
  String _currentLang = 'bn';

  @override
  void initState() {
    super.initState();
    _initServices();
  }

  Future<void> _initServices() async {
    await _tts.setLanguage("bn-BD");
    await _tts.setSpeechRate(0.5);
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _toggleListening() async {
    if (!_isListening) {
      bool available = await _speech.initialize();
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          localeId: _currentLang == 'bn' ? 'bn-BD' : 'en-US',
          onResult: (result) {
            setState(() {
              _controller.text = result.recognizedWords;
              if (result.finalResult) {
                _isListening = false;
                _handleSend();
              }
            });
          },
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  Future<void> _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty && _attachedImage == null) return;

    final imageFile = _attachedImage;
    setState(() {
      _messages.add({
        'role': 'user',
        'content': text.isEmpty ? 'Attached Image' : text,
        'image': imageFile,
        'time': DateTime.now(),
      });
      _controller.clear();
      _attachedImage = null;
      _isTyping = true;
    });
    _scrollToBottom();

    try {
      String? base64Image;
      String? mimeType;
      if (imageFile != null) {
        final bytes = await imageFile.readAsBytes();
        base64Image = base64Encode(bytes);
        mimeType = 'image/${imageFile.path.split('.').last}';
      }

      final response = await _dio.post(
        'https://Dalankotha.tech/api/chat',
        data: {
          'userId': 'mobile_user_demo',
          'messages': _messages.map((m) => {'role': m['role'], 'content': m['content']}).toList(),
          'lang': _currentLang,
          if (base64Image != null)
            'experimental_attachments': [
              {
                'name': 'image.png',
                'contentType': mimeType,
                'url': 'data:$mimeType;base64,$base64Image',
              }
            ],
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final botReply = data['text'] ?? "";
        final toolResults = data['toolResults'] as List?;
        
        String? generatedImageUrl;
        if (toolResults != null) {
          for (var res in toolResults) {
            if ((res['toolName'] == 'generate_visual_design' || res['toolName'] == 'generate_design_image') && 
                res['result'] != null && 
                res['result']['success'] == true) {
              generatedImageUrl = res['result']['url'];
            }
          }
        }

        setState(() {
          _messages.add({
            'role': 'assistant',
            'content': botReply,
            'imageUrl': generatedImageUrl,
            'time': DateTime.now(),
          });
          _isTyping = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'Sorry, I am having trouble connecting right now.',
          'time': DateTime.now(),
        });
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.auto_awesome, color: Colors.blue, size: 18),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI Consultant', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text(_isTyping ? 'Assistant is typing...' : 'Always Active', style: TextStyle(fontSize: 11, color: _isTyping ? Colors.blue : Colors.green)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => setState(() => _currentLang = _currentLang == 'bn' ? 'en' : 'bn'),
            icon: Text(_currentLang.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
          ),
          const SizedBox(width: 8),
        ],
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),
          if (_isTyping) _buildTypingIndicator(),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    bool isUser = msg['role'] == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 28, height: 28,
              margin: const EdgeInsets.only(right: 8, bottom: 4),
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF0F172A)),
              child: const Icon(Icons.auto_awesome, color: Colors.blue, size: 14),
            ),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isUser ? const Color(0xFF2563EB) : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: isUser ? const Radius.circular(20) : Radius.zero,
                  bottomRight: isUser ? Radius.zero : const Radius.circular(20),
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 2))
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (msg['image'] != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(msg['image'] as File, height: 180, width: double.infinity, fit: BoxFit.cover),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (msg['imageUrl'] != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CachedNetworkImage(
                        imageUrl: msg['imageUrl'] as String,
                        placeholder: (context, url) => Container(height: 180, color: Colors.grey.shade100, child: const Center(child: CircularProgressIndicator())),
                        errorWidget: (context, url, error) => const Icon(Icons.error),
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  Text(
                    msg['content'] as String,
                    style: TextStyle(color: isUser ? Colors.white : const Color(0xFF1E293B), fontSize: 14, height: 1.5),
                  ),
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Text(
                      DateFormat('HH:mm').format(msg['time'] as DateTime),
                      style: TextStyle(color: isUser ? Colors.white70 : Colors.grey, fontSize: 9),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          const SizedBox(width: 36),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
            child: const SizedBox(width: 20, height: 10, child: LinearProgressIndicator(minHeight: 1, backgroundColor: Colors.transparent)),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 32),
      decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE2E8F0)))),
      child: Column(
        children: [
          if (_attachedImage != null) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(_attachedImage!, height: 80, width: 80, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: -10, right: -10,
                    child: IconButton(onPressed: () => setState(() => _attachedImage = null), icon: const Icon(Icons.cancel, color: Colors.red)),
                  ),
                ],
              ),
            ),
          ],
          Row(
            children: [
              IconButton(onPressed: () async {
                final img = await _picker.pickImage(source: ImageSource.gallery);
                if (img != null) setState(() => _attachedImage = File(img.path));
              }, icon: const Icon(Icons.image_outlined, color: Color(0xFF64748B))),
              Expanded(
                child: TextField(
                  controller: _controller,
                  onSubmitted: (_) => _handleSend(),
                  decoration: InputDecoration(
                    hintText: _currentLang == 'bn' ? 'পরামর্শ পেতে বার্তা লিখুন...' : 'Ask for advice...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  ),
                ),
              ),
              IconButton(
                onPressed: _toggleListening,
                icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? Colors.red : const Color(0xFF64748B)),
              ),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: _handleSend,
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF0F172A)),
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
