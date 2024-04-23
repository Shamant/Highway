import React from 'react';
import { db } from './config';

class DeleteAllDocuments extends React.Component {
  deleteDocuments = async () => {
    try {
      const collectionRef = db.collection('users');
      const querySnapshot = await collectionRef.get();

      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('All documents in collection deleted successfully.');
    } catch (error) {
      console.error('Error deleting documents:', error);
    }
  };

  render() {
    return (
      <button onClick={this.deleteDocuments}>Delete All Documents</button>
    );
  }
}

export default DeleteAllDocuments;
