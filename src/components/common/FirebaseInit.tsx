import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from '../../config/firebase';
import { migrateLocalStorageToFirestore } from '../../services/firestoreService';
import { getStorageItem, setStorageItem } from '../../services/localStorageService';

const MIGRATION_KEY = 'habitApp_firebaseMigrated';

export function FirebaseInit() {
  const [migrationStatus, setMigrationStatus] = useState<{
    isComplete: boolean;
    message?: string;
  }>({ isComplete: true });

  useEffect(() => {
    const performMigration = async () => {
      // Only migrate if Firebase is configured and migration hasn't been done
      if (!isFirebaseConfigured()) {
        return;
      }

      const isMigrated = getStorageItem<boolean>(MIGRATION_KEY, false);
      if (isMigrated) {
        return;
      }

      setMigrationStatus({ isComplete: false, message: 'Migrando datos a la nube...' });

      const result = await migrateLocalStorageToFirestore();

      if (result.success) {
        setStorageItem(MIGRATION_KEY, true);
        setMigrationStatus({
          isComplete: true,
          message: result.message,
        });
        console.log('✅ Migration completed:', result.message);
      } else {
        console.error('❌ Migration failed:', result.message);
        setMigrationStatus({ isComplete: true });
      }
    };

    performMigration();
  }, []);

  if (!migrationStatus.isComplete) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
          <p>{migrationStatus.message}</p>
        </div>
      </div>
    );
  }

  return null;
}
