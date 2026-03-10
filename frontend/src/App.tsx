import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { SettingsPanel } from './components/SettingsPanel';
import { useChatStore } from './store/chatStore';

function App() {
  const { isSettingsOpen } = useChatStore();

  return (
    <div className="dark flex flex-col h-screen bg-gray-950 text-gray-100">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-gray-700 bg-gray-900">
            <ModelSelector />
          </div>
          <ChatWindow />
          <ChatInput />
        </main>
        {isSettingsOpen && <SettingsPanel />}
      </div>
    </div>
  );
}

export default App;
