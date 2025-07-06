import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import useFetch from '@/services/useFetch';
import { getTicketDetails, addTicketReply, updateTicketStatus } from '@/services/api';
import { SupportTicket } from '@/types';
import StatusPicker from '@/components/admin/StatusPicker';

const TICKET_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const TicketDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const ticketId = Array.isArray(id) ? id[0] : id;
  const { user, token } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ticket, loading, error, refetch } = useFetch<SupportTicket | null>(
    () => getTicketDetails(token!, ticketId!),
    !!(token && ticketId)
  );

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    if (!reply.trim() || !token || !ticketId) return;
    setIsSubmitting(true);
    try {
      await addTicketReply(token, ticketId, reply);
      setReply('');
      refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reply.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
     if (!token || !ticketId || !ticket || newStatus === ticket.status) return;
    try {
      await updateTicketStatus(token, ticketId, newStatus);
      refetch();
      Alert.alert('Success', 'Ticket status updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#007AFF';
      case 'in_progress': return '#ffc107';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading && !ticket) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <Text style={styles.errorText}>Error: {error.message}</Text>;
  if (!ticket) return <Text style={styles.errorText}>Ticket not found.</Text>;
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>{ticket.subject}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
              <Text style={styles.statusText}>{ticket.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
        </View>

        {user?.role === 'admin' && (
            <View style={styles.adminControls}>
                <Text style={styles.adminLabel}>Update Status:</Text>
                <StatusPicker
                    selectedValue={ticket.status}
                    onValueChange={handleStatusChange}
                    options={TICKET_STATUS_OPTIONS}
                />
            </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
        >
          {ticket.messages?.map((msg, index) => (
            <View
              key={msg.id || index}
              style={[
                styles.messageBubble,
                msg.senderId === user?.uid ? styles.userBubble : styles.agentBubble,
              ]}
            >
              <Text style={[styles.senderName, msg.senderId === user?.uid && styles.userSenderName]}>{msg.senderName} ({msg.senderType})</Text>
              <Text style={[styles.messageText, msg.senderId === user?.uid && styles.userMessageText]}>{msg.message}</Text>
              <Text style={[styles.messageTimestamp, msg.senderId === user?.uid && styles.userTimestamp]}>
              {msg.timestamp && typeof msg.timestamp === 'object' && msg.timestamp._seconds
                  ? new Date(msg.timestamp._seconds * 1000).toLocaleString()
                  : msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''
                }
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            value={reply}
            onChangeText={setReply}
            placeholder="Type your reply..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (isSubmitting || !reply.trim()) && styles.sendButtonDisabled]} 
            onPress={handleSendReply}
            disabled={isSubmitting || !reply.trim()}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  adminControls: { padding: 16, backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  adminLabel: { marginBottom: 8, fontWeight: 'bold' },
  messagesContainer: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 12 },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  agentBubble: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  senderName: { fontWeight: 'bold', marginBottom: 4, color: '#555' },
  userSenderName: { color: '#e0eaff' },
  messageText: { fontSize: 16, color: '#000' },
  userMessageText: { color: 'white' },
  messageTimestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
  userTimestamp: { color: '#e0eaff' },
  replyContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc', backgroundColor: 'white' },
  replyInput: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 16 },
  sendButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#a0c7ff' },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
  errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
});

export default TicketDetailsScreen;