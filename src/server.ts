import 'reflect-metadata';
import { app } from './app';
import { prisma } from './shared/container';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Desconectado do banco de dados');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Desconectado do banco de dados');
  process.exit(0);
});

startServer();
