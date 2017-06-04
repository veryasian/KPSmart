package server.control;

import javax.swing.JTextArea;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

import server.handlers.initialisers.DatabaseInitialiser;
import server.handlers.operations.Operations;
import server.handlers.websocket.KPSWebSocketHandler;

public class ServerControl {

	private int port = 8080;
	private Server server;

	private JTextArea logPanel = null;
	private DatabaseInitialiser dbInitialiser = new DatabaseInitialiser();

	public ServerControl(JTextArea logPanel) {
		this.logPanel = logPanel;
	}

	public void start(String port) throws Exception {
		dbInitialiser.initialiseDatabase();
		
		if (port == null || !port.matches("[-+]?\\d*\\.?\\d+")) {
			return;
		}
		this.port = Integer.parseInt(port);
		this.server = new Server(this.port);

		if (logPanel != null) {
			Operations.setLogPanel(logPanel);
		}

		WebSocketHandler wsHandler = new WebSocketHandler() {
			@Override
			public void configure(WebSocketServletFactory factory) {
				factory.register(KPSWebSocketHandler.class);
			}
		};

		server.setHandler(wsHandler);
		server.start();
		server.join();
	}
}