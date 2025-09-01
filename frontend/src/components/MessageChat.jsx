import React from 'react';

const MessageChat = () => {
    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <h3>Контакты</h3>
                <div style={{padding: '10px 0'}}>Список контактов будет здесь</div>
            </div>
            
            <div className="chat-main">
                <div className="chat-messages">
                    <div style={{marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                        <strong>Пользователь 1</strong>: Привет!
                        <small style={{display: 'block', color: '#6c757d', marginTop: '5px'}}>
                            29/08/2025 19:55
                        </small>
                    </div>
                </div>
                
                <form className="chat-input">
                    <input
                        type="text"
                        placeholder="Введите сообщение..."
                        className="form-control"
                    />
                    <button type="submit" className="btn btn-primary">Отправить</button>
                </form>
            </div>
        </div>
    );
};

export default MessageChat;
